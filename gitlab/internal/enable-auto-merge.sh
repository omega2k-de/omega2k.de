#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/gitlab/lib.sh
source "${SCRIPT_DIR}/../lib.sh"

require_command python3
require_command jq
require_command git

source_branch="${SOURCE_BRANCH:-$(git_current_branch)}"
target_branch="${TARGET_BRANCH:-$(git_default_target_branch)}"
mr_iid="${MR_IID:-}"
retry_attempts="${AUTO_MERGE_RETRY_ATTEMPTS:-36}"
retry_interval_seconds="${AUTO_MERGE_RETRY_INTERVAL_SECONDS:-5}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mr-iid)
      mr_iid="$2"
      shift 2
      ;;
    --source-branch)
      source_branch="$2"
      shift 2
      ;;
    --target-branch)
      target_branch="$2"
      shift 2
      ;;
    *)
      echo "[gitlab][error] unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

project_id="$(gitlab_project_id)"

if [[ -z "${mr_iid}" ]]; then
  mr_iid="$(
    gitlab_open_merge_request_by_branch "${project_id}" "${source_branch}" "${target_branch}" \
      | jq -r 'if length > 0 then .[0].iid else empty end'
  )"
fi

if [[ -z "${mr_iid}" ]]; then
  echo "[gitlab][error] could not resolve MR IID for ${source_branch} -> ${target_branch}" >&2
  exit 1
fi

attempt=1
while (( attempt <= retry_attempts )); do
  mr_json="$(gitlab_merge_request "${project_id}" "${mr_iid}")"
  mr_state="$(printf '%s' "${mr_json}" | jq -r '.state')"
  has_conflicts="$(printf '%s' "${mr_json}" | jq -r '.has_conflicts // false')"
  auto_merge_enabled="$(printf '%s' "${mr_json}" | jq -r '.merge_when_pipeline_succeeds // false')"
  mr_sha="$(printf '%s' "${mr_json}" | jq -r '.sha // empty')"

  if [[ "${mr_state}" != "opened" ]]; then
    echo "[gitlab][error] MR ${mr_iid} is not open (state=${mr_state})" >&2
    printf '%s' "${mr_json}" | jq -r '{iid,state,detailed_merge_status,merge_error,web_url}' >&2
    exit 1
  fi

  if [[ "${has_conflicts}" == "true" ]]; then
    echo "[gitlab][error] MR ${mr_iid} has conflicts and cannot enable auto-merge yet" >&2
    printf '%s' "${mr_json}" | jq -r '{iid,state,merge_status,detailed_merge_status,has_conflicts,web_url}' >&2
    exit 1
  fi

  if [[ "${auto_merge_enabled}" == "true" ]]; then
    printf '%s' "${mr_json}" | jq -r '{iid,state,merge_when_pipeline_succeeds,detailed_merge_status,web_url,message:"already_enabled"}'
    exit 0
  fi

  if [[ -z "${mr_sha}" ]]; then
    if (( attempt == retry_attempts )); then
      echo "[gitlab][error] MR ${mr_iid} has no sha after ${retry_attempts} attempts" >&2
      printf '%s' "${mr_json}" | jq -r '{iid,state,detailed_merge_status,web_url}' >&2
      exit 1
    fi
    echo "[gitlab] waiting for MR ${mr_iid} sha before enabling auto-merge (attempt ${attempt}/${retry_attempts})"
    sleep "${retry_interval_seconds}"
    ((attempt++))
    continue
  fi

  merge_request_response_file="$(mktemp)"
  merge_request_status_code="$(
    gitlab_merge_request_merge_status "${project_id}" "${mr_iid}" "${merge_request_response_file}" \
      --data-urlencode "auto_merge=true" \
      --data-urlencode "merge_when_pipeline_succeeds=true" \
      --data-urlencode "should_remove_source_branch=true" \
      --data-urlencode "sha=${mr_sha}"
  )"

  if [[ "${merge_request_status_code}" -ge 200 && "${merge_request_status_code}" -lt 300 ]]; then
    cat "${merge_request_response_file}" \
      | jq -r '{iid,message,state,merge_when_pipeline_succeeds,should_remove_source_branch,detailed_merge_status,web_url}'
    rm -f "${merge_request_response_file}"
    exit 0
  fi

  merge_request_error_body="$(cat "${merge_request_response_file}")"
  rm -f "${merge_request_response_file}"

  if [[ "${merge_request_status_code}" == "405" ]] && (( attempt < retry_attempts )); then
    echo "[gitlab] merge endpoint not ready for MR ${mr_iid} yet (attempt ${attempt}/${retry_attempts})"
    sleep "${retry_interval_seconds}"
    ((attempt++))
    continue
  fi

  echo "[gitlab][error] PUT /projects/${project_id}/merge_requests/${mr_iid}/merge -> HTTP ${merge_request_status_code}" >&2
  printf '%s\n' "${merge_request_error_body}" >&2
  exit 1
done

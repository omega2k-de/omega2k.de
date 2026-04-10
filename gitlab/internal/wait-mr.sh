#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/gitlab/lib.sh
source "${SCRIPT_DIR}/../lib.sh"

require_command python3
require_command jq
require_command git
require_command sleep
require_command date

source_branch="${SOURCE_BRANCH:-$(git_current_branch)}"
target_branch="${TARGET_BRANCH:-$(git_default_target_branch)}"
mr_iid="${MR_IID:-}"
interval_seconds="${MR_WAIT_INTERVAL_SECONDS:-20}"
timeout_seconds="${MR_WAIT_TIMEOUT_SECONDS:-3600}"
inspect_on_fail="${MR_WAIT_INSPECT_ON_FAIL:-1}"
trace_tail_lines="${TRACE_TAIL_LINES:-120}"
status_only="${STATUS_ONLY:-0}"

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
    --interval-seconds)
      interval_seconds="$2"
      shift 2
      ;;
    --timeout-seconds)
      timeout_seconds="$2"
      shift 2
      ;;
    --trace-tail-lines)
      trace_tail_lines="$2"
      shift 2
      ;;
    --status-only)
      status_only="1"
      shift
      ;;
    --no-inspect-on-fail)
      inspect_on_fail="0"
      shift
      ;;
    *)
      echo "[gitlab][error] unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

project_id="$(gitlab_project_id)"

if [[ -z "${mr_iid}" ]]; then
  mr_iid="$(gitlab_resolve_mr_iid_by_branch "${project_id}" "${source_branch}" "${target_branch}")"
fi

if [[ -z "${mr_iid}" ]]; then
  echo "[gitlab][error] could not resolve MR IID for ${source_branch} -> ${target_branch}" >&2
  exit 1
fi

start_epoch="$(date +%s)"
last_inspected_pipeline_id=""

while true; do
  mr_json="$(gitlab_merge_request "${project_id}" "${mr_iid}")"

  state="$(printf '%s' "${mr_json}" | jq -r '.state')"
  merge_status="$(printf '%s' "${mr_json}" | jq -r '.merge_status // "unknown"')"
  has_conflicts="$(printf '%s' "${mr_json}" | jq -r '.has_conflicts // false')"
  detailed_status="$(printf '%s' "${mr_json}" | jq -r '.detailed_merge_status // "unknown"')"
  pipeline_id="$(printf '%s' "${mr_json}" | jq -r '.head_pipeline.id // empty')"
  pipeline_status="$(printf '%s' "${mr_json}" | jq -r '.head_pipeline.status // "none"')"
  effective_pipeline_status="${pipeline_status}"
  web_url="$(printf '%s' "${mr_json}" | jq -r '.web_url')"

  if [[ -n "${pipeline_id}" ]]; then
    effective_pipeline_status="$(
      gitlab_effective_pipeline_status "${project_id}" "${pipeline_id}" "${pipeline_status}"
    )"
  fi

  if [[ "${status_only}" == "1" ]]; then
    printf '%s' "${mr_json}" \
      | jq -r --arg effective_status "${effective_pipeline_status}" '{mr:{iid,state,merge_status,detailed_merge_status,has_conflicts,web_url},pipeline:{id:(.head_pipeline.id // null),status:(.head_pipeline.status // "none"),effective_status:$effective_status,sha:(.head_pipeline.sha // null),web_url:(.head_pipeline.web_url // null)}}'
    exit 0
  fi

  echo "[gitlab] mr=${mr_iid} state=${state} merge_status=${merge_status} detailed=${detailed_status} pipeline=${pipeline_id:-none}:${pipeline_status} effective=${effective_pipeline_status}"

  if [[ "${state}" == "merged" ]]; then
    printf '%s' "${mr_json}" | jq -r '{iid,state,web_url,merged_at,merge_commit_sha,message:"merged"}'
    exit 0
  fi

  if [[ "${state}" != "opened" ]]; then
    echo "[gitlab][error] MR ${mr_iid} is not open (state=${state})" >&2
    printf '%s' "${mr_json}" | jq -r '{iid,state,detailed_merge_status,merge_error,web_url}' >&2
    exit 1
  fi

  if [[ "${has_conflicts}" == "true" || "${merge_status}" == "cannot_be_merged" ]]; then
    echo "[gitlab][error] MR ${mr_iid} cannot be merged in current state" >&2
    printf '%s' "${mr_json}" | jq -r '{iid,state,merge_status,detailed_merge_status,has_conflicts,web_url}' >&2
    exit 1
  fi

  if [[ "${effective_pipeline_status}" == "failed" || "${effective_pipeline_status}" == "canceled" || "${effective_pipeline_status}" == "canceling" ]]; then
    echo "[gitlab][error] pipeline ${pipeline_id:-unknown} status=${pipeline_status} effective=${effective_pipeline_status}" >&2
    if [[ "${inspect_on_fail}" == "1" && -n "${pipeline_id}" && "${pipeline_id}" != "${last_inspected_pipeline_id}" ]]; then
      last_inspected_pipeline_id="${pipeline_id}"
      "${SCRIPT_DIR}/inspect-pipeline.sh" \
        --pipeline-id "${pipeline_id}" \
        --trace-tail-lines "${trace_tail_lines}" || true
    fi
    exit 1
  fi

  now_epoch="$(date +%s)"
  elapsed_seconds="$((now_epoch - start_epoch))"
  if (( elapsed_seconds >= timeout_seconds )); then
    echo "[gitlab][error] timeout while waiting for MR ${mr_iid} merge (${timeout_seconds}s)" >&2
    printf '%s' "${mr_json}" | jq -r '{iid,state,detailed_merge_status,web_url}' >&2
    exit 1
  fi

  sleep "${interval_seconds}"
done

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

ref="${TARGET_BRANCH:-$(git_default_target_branch)}"
sha="${SHA:-}"
pipeline_id="${PIPELINE_ID:-}"
interval_seconds="${MAIN_PIPELINE_WAIT_INTERVAL_SECONDS:-20}"
timeout_seconds="${MAIN_PIPELINE_WAIT_TIMEOUT_SECONDS:-7200}"
inspect_on_fail="${MAIN_PIPELINE_WAIT_INSPECT_ON_FAIL:-1}"
trace_tail_lines="${TRACE_TAIL_LINES:-120}"
status_only="${STATUS_ONLY:-0}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ref)
      ref="$2"
      shift 2
      ;;
    --sha)
      sha="$2"
      shift 2
      ;;
    --pipeline-id)
      pipeline_id="$2"
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
start_epoch="$(date +%s)"
inspected_failure_pipeline_id=""

resolve_pipeline_id() {
  if [[ -n "${pipeline_id}" ]]; then
    printf '%s' "${pipeline_id}"
    return
  fi

  if [[ -n "${sha}" ]]; then
    gitlab_pipeline_id_by_ref_sha "${project_id}" "${ref}" "${sha}"
    return
  fi

  gitlab_latest_pipeline_id_by_ref "${project_id}" "${ref}"
}

while true; do
  resolved_pipeline_id="$(resolve_pipeline_id)"

  if [[ -z "${resolved_pipeline_id}" ]]; then
    if [[ "${status_only}" == "1" ]]; then
      jq -n --arg ref "${ref}" --arg sha "${sha}" '{pipeline:null, ref:$ref, sha:($sha | select(length > 0)), message:"not_found"}'
      exit 0
    fi
    echo "[gitlab] waiting for pipeline on ref=${ref}${sha:+ sha=${sha}}"
  else
    pipeline_id="${resolved_pipeline_id}"
    pipeline_json="$(gitlab_pipeline "${project_id}" "${pipeline_id}")"
    status="$(printf '%s' "${pipeline_json}" | jq -r '.status')"
    effective_status="$(gitlab_effective_pipeline_status "${project_id}" "${pipeline_id}" "${status}")"

    if [[ "${status_only}" == "1" ]]; then
      printf '%s' "${pipeline_json}" \
        | jq -r --arg effective_status "${effective_status}" '{pipeline:{id,status,effective_status,ref,sha,web_url,updated_at}}'
      exit 0
    fi

    echo "[gitlab] main-pipeline id=${pipeline_id} ref=${ref} status=${status} effective=${effective_status}"

    case "${effective_status}" in
      success)
        printf '%s' "${pipeline_json}" \
          | jq -r --arg effective_status "${effective_status}" '{pipeline:{id,status,effective_status,ref,sha,web_url,updated_at},message:"success"}'
        exit 0
        ;;
      failed|canceled|canceling)
        echo "[gitlab][error] main-pipeline id=${pipeline_id} status=${status} effective=${effective_status}" >&2
        if [[ "${inspect_on_fail}" == "1" && "${pipeline_id}" != "${inspected_failure_pipeline_id}" ]]; then
          inspected_failure_pipeline_id="${pipeline_id}"
          "${SCRIPT_DIR}/inspect-pipeline.sh" \
            --pipeline-id "${pipeline_id}" \
            --trace-tail-lines "${trace_tail_lines}" || true
        fi
        exit 1
        ;;
      skipped)
        printf '%s' "${pipeline_json}" \
          | jq -r --arg effective_status "${effective_status}" '{pipeline:{id,status,effective_status,ref,sha,web_url,updated_at},message:"skipped"}'
        exit 0
        ;;
      manual)
        echo "[gitlab][error] main-pipeline id=${pipeline_id} is manual and requires operator action" >&2
        printf '%s' "${pipeline_json}" | jq -r '{pipeline:{id,status,ref,sha,web_url,updated_at}}' >&2
        exit 1
        ;;
      pending|running|created|preparing|waiting_for_resource)
        ;;
      *)
        echo "[gitlab][error] unexpected pipeline status: ${status}" >&2
        printf '%s' "${pipeline_json}" | jq -r '{pipeline:{id,status,ref,sha,web_url,updated_at}}' >&2
        exit 1
        ;;
    esac
  fi

  now_epoch="$(date +%s)"
  elapsed_seconds="$((now_epoch - start_epoch))"
  if (( elapsed_seconds >= timeout_seconds )); then
    echo "[gitlab][error] timeout while waiting for pipeline on ref=${ref}${sha:+ sha=${sha}} (${timeout_seconds}s)" >&2
    if [[ -n "${pipeline_id}" ]]; then
      gitlab_pipeline "${project_id}" "${pipeline_id}" \
        | jq -r '{pipeline:{id,status,ref,sha,web_url,updated_at}}' >&2
    fi
    exit 1
  fi

  sleep "${interval_seconds}"
done

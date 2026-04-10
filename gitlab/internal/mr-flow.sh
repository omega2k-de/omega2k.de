#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source_branch="${SOURCE_BRANCH:-}"
target_branch="${TARGET_BRANCH:-}"
mr_title="${MR_TITLE:-}"
interval_seconds="${MR_WAIT_INTERVAL_SECONDS:-20}"
timeout_seconds="${MR_WAIT_TIMEOUT_SECONDS:-3600}"
trace_tail_lines="${TRACE_TAIL_LINES:-120}"
wait_main_pipeline="${MR_FLOW_WAIT_MAIN_PIPELINE:-1}"
main_pipeline_ref="${MAIN_PIPELINE_REF:-}"
main_pipeline_timeout_seconds="${MAIN_PIPELINE_WAIT_TIMEOUT_SECONDS:-7200}"
main_pipeline_interval_seconds="${MAIN_PIPELINE_WAIT_INTERVAL_SECONDS:-20}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source-branch)
      source_branch="$2"
      shift 2
      ;;
    --target-branch)
      target_branch="$2"
      shift 2
      ;;
    --title)
      mr_title="$2"
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
    --wait-main-pipeline)
      wait_main_pipeline="1"
      shift
      ;;
    --no-wait-main-pipeline)
      wait_main_pipeline="0"
      shift
      ;;
    --main-pipeline-ref)
      main_pipeline_ref="$2"
      shift 2
      ;;
    --main-pipeline-timeout-seconds)
      main_pipeline_timeout_seconds="$2"
      shift 2
      ;;
    --main-pipeline-interval-seconds)
      main_pipeline_interval_seconds="$2"
      shift 2
      ;;
    *)
      echo "[gitlab][error] unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

create_args=()
[[ -n "${source_branch}" ]] && create_args+=(--source-branch "${source_branch}")
[[ -n "${target_branch}" ]] && create_args+=(--target-branch "${target_branch}")
[[ -n "${mr_title}" ]] && create_args+=(--title "${mr_title}")

mr_json="$("${SCRIPT_DIR}/create-mr.sh" "${create_args[@]}")"
mr_iid="$(printf '%s' "${mr_json}" | jq -r '.iid')"

if [[ -z "${mr_iid}" || "${mr_iid}" == "null" ]]; then
  echo "[gitlab][error] MR IID missing from create-mr output" >&2
  printf '%s\n' "${mr_json}" >&2
  exit 1
fi

auto_args=(--mr-iid "${mr_iid}")
[[ -n "${source_branch}" ]] && auto_args+=(--source-branch "${source_branch}")
[[ -n "${target_branch}" ]] && auto_args+=(--target-branch "${target_branch}")
"${SCRIPT_DIR}/enable-auto-merge.sh" "${auto_args[@]}"

wait_args=(
  --mr-iid "${mr_iid}"
  --interval-seconds "${interval_seconds}"
  --timeout-seconds "${timeout_seconds}"
  --trace-tail-lines "${trace_tail_lines}"
)
[[ -n "${source_branch}" ]] && wait_args+=(--source-branch "${source_branch}")
[[ -n "${target_branch}" ]] && wait_args+=(--target-branch "${target_branch}")
"${SCRIPT_DIR}/wait-mr.sh" "${wait_args[@]}"

if [[ "${wait_main_pipeline}" == "1" ]]; then
  # shellcheck source=scripts/gitlab/lib.sh
  source "${SCRIPT_DIR}/../lib.sh"
  project_id="$(gitlab_project_id)"
  merged_mr_json="$(gitlab_merge_request "${project_id}" "${mr_iid}")"
  merge_commit_sha="$(printf '%s' "${merged_mr_json}" | jq -r '.merge_commit_sha // empty')"
  if [[ -z "${main_pipeline_ref}" ]]; then
    main_pipeline_ref="$(printf '%s' "${merged_mr_json}" | jq -r '.target_branch')"
  fi

  main_wait_args=(
    --ref "${main_pipeline_ref}"
    --interval-seconds "${main_pipeline_interval_seconds}"
    --timeout-seconds "${main_pipeline_timeout_seconds}"
    --trace-tail-lines "${trace_tail_lines}"
  )
  [[ -n "${merge_commit_sha}" ]] && main_wait_args+=(--sha "${merge_commit_sha}")
  "${SCRIPT_DIR}/wait-main-pipeline.sh" "${main_wait_args[@]}"
fi

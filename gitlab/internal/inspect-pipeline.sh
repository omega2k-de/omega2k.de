#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/gitlab/lib.sh
source "${SCRIPT_DIR}/../lib.sh"

require_command python3
require_command jq
require_command git
require_command tail

source_branch="${SOURCE_BRANCH:-$(git_current_branch)}"
target_branch="${TARGET_BRANCH:-$(git_default_target_branch)}"
mr_iid="${MR_IID:-}"
pipeline_id="${PIPELINE_ID:-}"
job_id="${JOB_ID:-}"
trace_tail_lines="${TRACE_TAIL_LINES:-120}"
max_failed_jobs="${MAX_FAILED_JOBS:-3}"
artifacts_dir="${ARTIFACTS_DIR:-}"
artifact_path="${ARTIFACT_PATH:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mr-iid)
      mr_iid="$2"
      shift 2
      ;;
    --pipeline-id)
      pipeline_id="$2"
      shift 2
      ;;
    --job-id)
      job_id="$2"
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
    --trace-tail-lines)
      trace_tail_lines="$2"
      shift 2
      ;;
    --max-failed-jobs)
      max_failed_jobs="$2"
      shift 2
      ;;
    --artifacts-dir)
      artifacts_dir="$2"
      shift 2
      ;;
    --artifact-path)
      artifact_path="$2"
      shift 2
      ;;
    *)
      echo "[gitlab][error] unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

project_id="$(gitlab_project_id)"

download_job_artifacts() {
  local current_job_id="$1"
  local target_dir="$2"
  local artifact_rel_path="${3:-}"
  local output_path

  mkdir -p "${target_dir}"

  if [[ -n "${artifact_rel_path}" ]]; then
    output_path="${target_dir}/job-${current_job_id}-$(basename "${artifact_rel_path}")"
  else
    output_path="${target_dir}/job-${current_job_id}-artifacts.zip"
  fi

  gitlab_job_artifacts_download "${project_id}" "${current_job_id}" "${output_path}" "${artifact_rel_path}"

  printf '%s\n' "${output_path}"
}

if [[ -n "${job_id}" ]]; then
  job_json="$(gitlab_job "${project_id}" "${job_id}")"
  printf '%s\n' "${job_json}" | jq -r '{
    job: {
      id,
      name,
      status,
      stage,
      ref,
      failure_reason,
      allow_failure,
      web_url,
      pipeline: (.pipeline // null),
      artifacts_file: (.artifacts_file // null)
    }
  }'
  echo "[gitlab] trace tail for job ${job_id} (last ${trace_tail_lines} lines)"
  gitlab_job_trace "${project_id}" "${job_id}" | tail -n "${trace_tail_lines}" || true
  echo "[gitlab] end trace ${job_id}"
  if [[ -n "${artifacts_dir}" ]]; then
    if artifact_output="$(download_job_artifacts "${job_id}" "${artifacts_dir}" "${artifact_path}" 2>/dev/null)"; then
      echo "[gitlab] artifacts saved to ${artifact_output}"
    else
      echo "[gitlab] no downloadable artifacts found for job ${job_id}"
    fi
  fi
  exit 0
fi

if [[ -z "${mr_iid}" && -z "${pipeline_id}" ]]; then
  mr_iid="$(gitlab_resolve_mr_iid_by_branch "${project_id}" "${source_branch}" "${target_branch}")"
fi

if [[ -z "${pipeline_id}" && -n "${mr_iid}" ]]; then
  pipeline_id="$(gitlab_merge_request_pipeline_id "${project_id}" "${mr_iid}")"
fi

if [[ -z "${pipeline_id}" ]]; then
  echo "[gitlab][error] could not resolve pipeline id" >&2
  exit 1
fi

pipeline_json="$(gitlab_pipeline "${project_id}" "${pipeline_id}")"

printf '%s\n' "${pipeline_json}" | jq -r '{pipeline:{id,status,ref,sha,web_url,created_at,updated_at}}'

failed_jobs_json="$(gitlab_failed_pipeline_jobs "${project_id}" "${pipeline_id}")"
failed_job_count="$(printf '%s' "${failed_jobs_json}" | jq 'length')"

if [[ "${failed_job_count}" -eq 0 ]]; then
  echo "[gitlab] no failed, canceled, or canceling jobs found for pipeline ${pipeline_id}"
  exit 0
fi

printf '%s' "${failed_jobs_json}" \
  | jq -r '[.[] | {id,name,stage,status,failure_reason,allow_failure,web_url}]'

while IFS= read -r job_id; do
  [[ -n "${job_id}" ]] || continue
  echo "[gitlab] trace tail for failed job ${job_id} (last ${trace_tail_lines} lines)"
  gitlab_job_trace "${project_id}" "${job_id}" | tail -n "${trace_tail_lines}" || true
  if [[ -n "${artifacts_dir}" ]]; then
    if artifact_output="$(download_job_artifacts "${job_id}" "${artifacts_dir}" 2>/dev/null)"; then
      echo "[gitlab] artifacts saved to ${artifact_output}"
    else
      echo "[gitlab] no downloadable artifacts found for job ${job_id}"
    fi
  fi
  echo "[gitlab] end trace ${job_id}"
done < <(
  printf '%s' "${failed_jobs_json}" \
    | jq -r --argjson max_jobs "${max_failed_jobs}" '.[:$max_jobs][] | .id'
)

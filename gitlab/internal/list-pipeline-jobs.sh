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
pipeline_id="${PIPELINE_ID:-}"
format="${FORMAT:-tsv}"
failed_only="${FAILED_ONLY:-false}"

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
    --source-branch)
      source_branch="$2"
      shift 2
      ;;
    --target-branch)
      target_branch="$2"
      shift 2
      ;;
    --format)
      format="$2"
      shift 2
      ;;
    --failed-only)
      failed_only="true"
      shift
      ;;
    *)
      echo "[gitlab][error] unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

project_id="$(gitlab_project_id)"

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

jobs_json="$(gitlab_pipeline_jobs "${project_id}" "${pipeline_id}")"

if [[ "${failed_only}" == "true" ]]; then
  jobs_json="$(printf '%s' "${jobs_json}" | jq '[.[] | select(.status == "failed" or .status == "canceled" or .status == "canceling")]')"
fi

case "${format}" in
  json)
    printf '%s\n' "${jobs_json}"
    ;;
  tsv)
    printf '%s' "${jobs_json}" \
      | jq -r '.[] | [.id, .name, .status, .stage, (.failure_reason // "-"), .web_url] | @tsv'
    ;;
  summary)
    printf '%s' "${jobs_json}" \
      | jq -r --arg pipeline_id "${pipeline_id}" '{
          pipeline: ($pipeline_id | tonumber),
          total: length,
          by_status: (group_by(.status) | map({key: .[0].status, value: length}) | from_entries)
        }'
    ;;
  *)
    echo "[gitlab][error] unsupported format: ${format} (expected: json|tsv|summary)" >&2
    exit 1
    ;;
esac

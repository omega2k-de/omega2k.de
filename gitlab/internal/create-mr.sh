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
title="${MR_TITLE:-}"

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
      title="$2"
      shift 2
      ;;
    *)
      echo "[gitlab][error] unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [[ -z "${title}" ]]; then
  title="$(git log -1 --pretty=%s)"
fi

project_id="$(gitlab_project_id)"

existing_mr_json="$(
  gitlab_open_merge_request_by_branch "${project_id}" "${source_branch}" "${target_branch}" \
    | jq 'if length > 0 then .[0] else null end'
)"

if [[ "${existing_mr_json}" != "null" ]]; then
  printf '%s\n' "${existing_mr_json}" | jq -r '{iid,web_url,state,title,message:"existing_open_merge_request"}'
  exit 0
fi

gitlab_api_request POST "/projects/${project_id}/merge_requests" \
  --data-urlencode "source_branch=${source_branch}" \
  --data-urlencode "target_branch=${target_branch}" \
  --data-urlencode "title=${title}" \
  --data-urlencode "remove_source_branch=true" \
  | jq -r '{iid,web_url,state,title,sha:.sha,message:"created"}'

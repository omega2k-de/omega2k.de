#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=gitlab/lib.sh
source "${SCRIPT_DIR}/../lib.sh"

require_command python3
require_command jq
require_command git

enable_setting="${ENABLE_CI_JOB_TOKEN_PUSH:-0}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --enable)
      enable_setting="1"
      shift
      ;;
    *)
      echo "[gitlab][error] unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

project_id="$(gitlab_project_id)"
project_json="$(gitlab_project "${project_id}")"
message="status"

if [[ "${enable_setting}" == "1" ]]; then
  if [[ "$(printf '%s' "${project_json}" | jq -r '.ci_push_repository_for_job_token_allowed // false')" != "true" ]]; then
    gitlab_project_update "${project_id}" --data-urlencode "ci_push_repository_for_job_token_allowed=true" >/dev/null
    project_json="$(gitlab_project "${project_id}")"
    message="updated"
  else
    message="unchanged"
  fi
fi

printf '%s\n' "${project_json}" \
  | jq --arg message "${message}" '
      {
        project: {
          id: .id,
          path_with_namespace: .path_with_namespace,
          web_url: .web_url,
          default_branch: .default_branch
        },
        ci_job_token_push: {
          enabled: (.ci_push_repository_for_job_token_allowed // false),
          package_registry_access: (.ci_job_token_scope_enabled // false)
        },
        message: $message
      }
    '

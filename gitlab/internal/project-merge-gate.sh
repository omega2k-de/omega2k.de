#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/gitlab/lib.sh
source "${SCRIPT_DIR}/../lib.sh"

require_command python3
require_command jq
require_command git

branch="${TARGET_BRANCH:-}"
enable_pipeline_gate="${ENABLE_PIPELINE_GATE:-0}"
require_discussions_resolved="${REQUIRE_DISCUSSIONS_RESOLVED:-0}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)
      branch="$2"
      shift 2
      ;;
    --enable-pipeline-gate)
      enable_pipeline_gate="1"
      shift
      ;;
    --require-discussions-resolved)
      require_discussions_resolved="1"
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

if [[ -z "${branch}" ]]; then
  branch="$(printf '%s' "${project_json}" | jq -r '.default_branch')"
fi

message="status"
update_args=()

if [[ "${enable_pipeline_gate}" == "1" ]]; then
  if [[ "$(printf '%s' "${project_json}" | jq -r '.only_allow_merge_if_pipeline_succeeds // false')" != "true" ]]; then
    update_args+=(--data-urlencode "only_allow_merge_if_pipeline_succeeds=true")
  fi
  if [[ "${require_discussions_resolved}" == "1" ]] && [[ "$(printf '%s' "${project_json}" | jq -r '.only_allow_merge_if_all_discussions_are_resolved // false')" != "true" ]]; then
    update_args+=(--data-urlencode "only_allow_merge_if_all_discussions_are_resolved=true")
  fi

  if (( ${#update_args[@]} > 0 )); then
    gitlab_project_update "${project_id}" "${update_args[@]}" >/dev/null
    project_json="$(gitlab_project "${project_id}")"
    message="updated"
  else
    message="unchanged"
  fi
fi

protected_branches_json="$(gitlab_protected_branches "${project_id}")"

printf '%s\n%s\n' "${project_json}" "${protected_branches_json}" \
  | jq -s --arg branch "${branch}" --arg message "${message}" '
      .[0] as $project
      | .[1] as $protected_branches
      | ($protected_branches | map(select(.name == $branch)) | first) as $protected_branch
      | {
          project: {
            id: $project.id,
            path_with_namespace: $project.path_with_namespace,
            web_url: $project.web_url,
            default_branch: $project.default_branch
          },
          merge_gate: {
            branch: $branch,
            pipeline_required: ($project.only_allow_merge_if_pipeline_succeeds // false),
            discussions_required: ($project.only_allow_merge_if_all_discussions_are_resolved // false),
            remove_source_branch_after_merge: ($project.remove_source_branch_after_merge // false),
            merge_method: ($project.merge_method // "merge"),
            branch_protected: ($protected_branch != null),
            allow_force_push: ($protected_branch.allow_force_push // false),
            push_access_levels: (($protected_branch.push_access_levels // []) | map(.access_level_description)),
            merge_access_levels: (($protected_branch.merge_access_levels // []) | map(.access_level_description)),
            ready_for_protected_merges: (($project.only_allow_merge_if_pipeline_succeeds // false) and ($protected_branch != null))
          },
          message: $message
        }
    '

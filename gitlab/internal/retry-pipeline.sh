#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=gitlab/lib.sh
source "${SCRIPT_DIR}/../lib.sh"

require_command python3
require_command jq
require_command git

pipeline_id=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --pipeline-id)
      pipeline_id="$2"
      shift 2
      ;;
    *)
      echo "[gitlab][error] unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [[ -z "${pipeline_id}" ]]; then
  echo "[gitlab][error] missing required argument: --pipeline-id <id>" >&2
  exit 1
fi

project_id="$(gitlab_project_id)"
gitlab_pipeline_retry "${project_id}" "${pipeline_id}" \
  | jq '{
      pipeline: {
        id: .id,
        iid: .iid,
        ref: .ref,
        sha: .sha,
        status: .status,
        web_url: .web_url
      },
      message: "retried"
    }'

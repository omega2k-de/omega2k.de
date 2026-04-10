#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ $# -lt 2 ]]; then
  cat >&2 <<'EOF'
usage:
  ./gitlab/tool.sh mr create [args...]
  ./gitlab/tool.sh mr auto-merge [args...]
  ./gitlab/tool.sh mr wait [args...]
  ./gitlab/tool.sh mr status [args...]
  ./gitlab/tool.sh mr flow [args...]
  ./gitlab/tool.sh project merge-gate-status [args...]
  ./gitlab/tool.sh project merge-gate-enable [args...]
  ./gitlab/tool.sh project ci-job-token-push-status [args...]
  ./gitlab/tool.sh project ci-job-token-push-enable [args...]
  ./gitlab/tool.sh pipeline jobs [args...]
  ./gitlab/tool.sh pipeline failed-jobs [args...]
  ./gitlab/tool.sh pipeline inspect [args...]
  ./gitlab/tool.sh pipeline retry [args...]
  ./gitlab/tool.sh main-pipeline wait [args...]
  ./gitlab/tool.sh main-pipeline status [args...]
EOF
  exit 1
fi

scope="$1"
action="$2"
shift 2

case "${scope}:${action}" in
  mr:create)
    exec "${SCRIPT_DIR}/internal/create-mr.sh" "$@"
    ;;
  mr:auto-merge)
    exec "${SCRIPT_DIR}/internal/enable-auto-merge.sh" "$@"
    ;;
  mr:wait)
    exec "${SCRIPT_DIR}/internal/wait-mr.sh" "$@"
    ;;
  mr:status)
    exec "${SCRIPT_DIR}/internal/wait-mr.sh" --status-only "$@"
    ;;
  mr:flow)
    exec "${SCRIPT_DIR}/internal/mr-flow.sh" "$@"
    ;;
  project:merge-gate-status)
    exec "${SCRIPT_DIR}/internal/project-merge-gate.sh" "$@"
    ;;
  project:merge-gate-enable)
    exec "${SCRIPT_DIR}/internal/project-merge-gate.sh" --enable-pipeline-gate "$@"
    ;;
  project:ci-job-token-push-status)
    exec "${SCRIPT_DIR}/internal/project-ci-job-token-push.sh" "$@"
    ;;
  project:ci-job-token-push-enable)
    exec "${SCRIPT_DIR}/internal/project-ci-job-token-push.sh" --enable "$@"
    ;;
  pipeline:jobs)
    exec "${SCRIPT_DIR}/internal/list-pipeline-jobs.sh" "$@"
    ;;
  pipeline:failed-jobs)
    exec "${SCRIPT_DIR}/internal/list-pipeline-jobs.sh" --failed-only "$@"
    ;;
  pipeline:inspect)
    exec "${SCRIPT_DIR}/internal/inspect-pipeline.sh" "$@"
    ;;
  pipeline:retry)
    exec "${SCRIPT_DIR}/internal/retry-pipeline.sh" "$@"
    ;;
  main-pipeline:wait)
    exec "${SCRIPT_DIR}/internal/wait-main-pipeline.sh" "$@"
    ;;
  main-pipeline:status)
    exec "${SCRIPT_DIR}/internal/wait-main-pipeline.sh" --status-only "$@"
    ;;
  *)
    echo "[gitlab][error] unknown tool command: ${scope} ${action}" >&2
    exit 1
    ;;
esac

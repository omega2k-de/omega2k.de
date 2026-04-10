#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}/.."
CREATE_SCRIPT="${PROJECT_ROOT}/.specify/scripts/bash/create-new-feature.sh"

if [[ $# -lt 1 ]]; then
  echo "usage: ./scripts/specify-feature.sh \"feature description\"" >&2
  exit 1
fi

if ! command -v specify >/dev/null 2>&1; then
  echo "specify CLI not found. install with:" >&2
  echo "  uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v0.4.3" >&2
  exit 1
fi

if [[ ! -x "${CREATE_SCRIPT}" ]]; then
  echo "missing helper: ${CREATE_SCRIPT}" >&2
  exit 1
fi

cd "${PROJECT_ROOT}"
"${CREATE_SCRIPT}" "$@"

echo
echo "Next steps:"
echo "  1) Fill generated spec.md (see .specify/templates/spec-template.md)"
echo "  2) Run: specify check"
echo "  3) Run: specify plan"
echo "  4) Run: specify tasks"

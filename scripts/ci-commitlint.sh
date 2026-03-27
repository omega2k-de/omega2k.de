#!/bin/sh
set -eu

TO_REF="${CI_COMMIT_SHA:-HEAD}"
FROM_REF=""

if [ "${CI_PIPELINE_SOURCE:-}" = "merge_request_event" ] && [ -n "${CI_MERGE_REQUEST_DIFF_BASE_SHA:-}" ]; then
  FROM_REF="${CI_MERGE_REQUEST_DIFF_BASE_SHA}"
elif [ -n "${CI_COMMIT_BEFORE_SHA:-}" ] && [ "${CI_COMMIT_BEFORE_SHA}" != "0000000000000000000000000000000000000000" ]; then
  FROM_REF="${CI_COMMIT_BEFORE_SHA}"
else
  FROM_REF="$(git rev-list --max-count=1 --skip=1 "${TO_REF}" 2>/dev/null || true)"
fi

if [ -n "${FROM_REF}" ]; then
  echo "Linting commits from ${FROM_REF} to ${TO_REF}"
  pnpm exec commitlint --from "${FROM_REF}" --to "${TO_REF}" --verbose
  exit 0
fi

echo "Linting single commit ${TO_REF}"
git log -1 --pretty=%B "${TO_REF}" | pnpm exec commitlint --verbose

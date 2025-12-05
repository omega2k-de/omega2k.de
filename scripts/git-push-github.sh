#!/bin/bash
set -e

TEMP_FOLDER="/tmp/github"

cd "$( dirname -- "$( readlink -f -- "$0"; )"; )" || exit 1
cd ..

if [ -z "${GITHUB_TOKEN}" ]; then
  echo "❌ not in gitlab pipeline"
  exit 1
fi

GITHUB_REPO="https://x-access-token:${GITHUB_TOKEN}@github.com/omega2k-de/omega2k.de.git"

rm -rf "${TEMP_FOLDER}"
if git clone "$GITHUB_REPO" "${TEMP_FOLDER}"; then
  echo "Cloned existing GitHub repo."
else
  echo "❌ repo error"
  exit 2
fi

rsync -a --delete --exclude '.git' --exclude 'node_modules' "${CI_PROJECT_DIR:-.}/" "${TEMP_FOLDER}/"

cd "${TEMP_FOLDER}"
git config user.name "pkracht"
git add -A

if git diff --cached --quiet; then
  echo "no changes."
else
  if [ -n "${CI_COMMIT_TAG}" ]; then
    msg="Release ${CI_COMMIT_TAG} (from ${CI_COMMIT_SHORT_SHA})"
  else
    msg="Live deploy main (${CI_COMMIT_SHORT_SHA})"
  fi
  echo "$msg"
  git commit -m "$msg"
fi

if [ -n "${CI_COMMIT_TAG}" ]; then
  git tag -f "${CI_COMMIT_TAG}" HEAD
  git push origin main
  git push origin "${CI_COMMIT_TAG}"
else
  git push origin main
fi

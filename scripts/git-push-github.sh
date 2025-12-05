#!/bin/bash
set -e

TEMP_FOLDER="/tmp/github"
LOCAL_HASH="$(git rev-parse --verify HEAD)"

cd "$( dirname -- "$( readlink -f -- "$0"; )"; )" || exit 1
cd ..

if [ -z "${GITHUB_TOKEN}" ]; then
  echo "❌ not in gitlab pipeline"
  exit 1
fi

if [ -z "${APP_VERSION}" ]; then
  echo "❌ APP_VERSION not set"
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
git config user.email "1049314+pkracht@users.noreply.github.com"

git add -A

if git diff --cached --quiet; then
  echo "no changes."
else
  if [ -n "${CI_COMMIT_TAG}" ]; then
    msg="Release ${APP_VERSION} ${CI_COMMIT_TAG} (from ${CI_COMMIT_SHORT_SHA:-${LOCAL_HASH})})"
  else
    msg="Live deploy ${APP_VERSION} main (${CI_COMMIT_SHORT_SHA:-${LOCAL_HASH}})"
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

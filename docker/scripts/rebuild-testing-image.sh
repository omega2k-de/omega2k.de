#!/bin/bash

. ./docker/config/app-version
. ./docker/config/node-image

PWD="$(pwd)"

if [ ! -f "${PWD}/nx.json" ]; then
  echo ""
  echo "❌  wrong working dir. goto project root."
  exit 3
fi

if [ -z "${NODE_IMAGE}" ]; then
  echo ""
  echo "❌  NODE_IMAGE not defined"
  exit 2
fi

if [ -z "${APP_VERSION}" ]; then
  echo "❌  APP_VERSION not defined"
  exit 1
fi

docker pull ${NODE_IMAGE}:latest >/dev/null 2>&1 || echo ${NODE_IMAGE}:latest missing
docker build --file ./docker/Dockerfile.node --cache-from ${NODE_IMAGE}:latest --tag ${NODE_IMAGE}:${APP_VERSION} .
docker image tag ${NODE_IMAGE}:${APP_VERSION} ${NODE_IMAGE}:latest
docker image push --quiet --all-tags ${NODE_IMAGE}
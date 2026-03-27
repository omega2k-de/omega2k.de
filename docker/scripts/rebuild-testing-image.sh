#!/bin/bash

. ./docker/config/node-image

NODE_IMAGE_TAG="${NODE_IMAGE_TAG:-latest}"

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

docker pull ${NODE_IMAGE}:latest >/dev/null 2>&1 || echo ${NODE_IMAGE}:latest missing
docker build --file ./docker/Dockerfile.node --cache-from ${NODE_IMAGE}:latest --tag ${NODE_IMAGE}:${NODE_IMAGE_TAG} .
docker image tag ${NODE_IMAGE}:${NODE_IMAGE_TAG} ${NODE_IMAGE}:latest
docker image push --quiet ${NODE_IMAGE}:${NODE_IMAGE_TAG}
docker image push --quiet ${NODE_IMAGE}:latest

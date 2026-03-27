#!/bin/bash

. ./docker/config/node-image

NODE_IMAGE_TAG="${NODE_IMAGE_TAG:-latest}"

UID="$(id -u)"
GID="$(id -g)"
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

docker run --rm --user ${UID}:${GID} -it --volume="${PWD}:/builds/developers/omega2k.de" --workdir="/builds/developers/omega2k.de" "${NODE_IMAGE}:${NODE_IMAGE_TAG}" pnpm e2e

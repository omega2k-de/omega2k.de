#!/bin/bash

. ./docker/config/app-version
. ./docker/config/node-image

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

if [ -z "${APP_VERSION}" ]; then
  echo "❌  APP_VERSION not defined"
  exit 1
fi

docker run --rm --user ${UID}:${GID} -it --volume="${PWD}:/builds/developers/omega2k.de" --workdir="/builds/developers/omega2k.de" "${NODE_IMAGE}:${APP_VERSION}" pnpm e2e
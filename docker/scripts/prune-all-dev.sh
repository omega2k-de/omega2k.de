#!/bin/sh
set -e

if [ -z "${DOCKER_PREVIEW_TOKEN}" ]; then
  echo "❌ not in gitlab pipeline"
  exit 1
fi

WEBSERVICE_WWW="$(docker ps --no-trunc --format '{{.Names}}' --filter 'name=webservice-www-')"
WEBSERVICE_API="$(docker ps --no-trunc --format '{{.Names}}' --filter 'name=webservice-api-')"

if [ -n "$WEBSERVICE_WWW" ]; then
  docker stop $(docker ps -a -q --filter "name=webservice-www-") || true
  docker rm $(docker ps -a -q --filter "name=webservice-www-") || true
fi

if [ -n "$WEBSERVICE_API" ]; then
  docker stop $(docker ps -a -q --filter "name=webservice-api-") || true
  docker rm $(docker ps -a -q --filter "name=webservice-api-") || true
fi

if [ -n "$WEBSERVICE_WWW" ]; then
  for CONTAINER in $WEBSERVICE_WWW; do
    wget "--header=User-Agent:${DOCKER_PREVIEW_TOKEN}" -O- "http://172.16.32.4/pihole-domains/remove/$(echo $CONTAINER | cut -d '-' -f3)-www.omega2k.de"
  done
fi

if [ -n "$WEBSERVICE_API" ]; then
  for CONTAINER in $WEBSERVICE_API; do
    wget "--header=User-Agent:${DOCKER_PREVIEW_TOKEN}" -O- "http://172.16.32.4/pihole-domains/remove/$(echo $CONTAINER | cut -d '-' -f3)-api.omega2k.de"
  done
fi

#!/bin/sh
set -e

if [ -z "${DOCKER_PREVIEW_TOKEN}" ]; then
  echo "❌ not in gitlab pipeline"
  exit 1
fi

docker stop $(docker ps -a -q --filter "name=webservice-www-${CI_COMMIT_SHORT_SHA}") || true
docker stop $(docker ps -a -q --filter "name=webservice-api-${CI_COMMIT_SHORT_SHA}") || true
docker stop $(docker ps -a -q --filter "name=webservice-redis-${CI_COMMIT_SHORT_SHA}") || true

docker rm $(docker ps -a -q --filter "name=webservice-www-${CI_COMMIT_SHORT_SHA}") || true
docker rm $(docker ps -a -q --filter "name=webservice-api-${CI_COMMIT_SHORT_SHA}") || true
docker rm $(docker ps -a -q --filter "name=webservice-redis-${CI_COMMIT_SHORT_SHA}") || true

docker network prune -f || true
docker image prune --all -f || true

wget "--header=User-Agent:${DOCKER_PREVIEW_TOKEN}" -O- http://172.16.32.4/pihole-domains/remove/${COMPOSE_DOMAIN_SSR}
wget "--header=User-Agent:${DOCKER_PREVIEW_TOKEN}" -O- http://172.16.32.4/pihole-domains/remove/${COMPOSE_DOMAIN_API}

echo "================================================================="
echo " DYNDNS"
echo " ➔ http://172.16.32.4/pihole-domains/remove/${COMPOSE_DOMAIN_SSR}"
echo " ➔ http://172.16.32.4/pihole-domains/remove/${COMPOSE_DOMAIN_API}"
echo "================================================================="
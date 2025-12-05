#!/bin/sh
set -e

if [ -z "${CI_COMMIT_SHORT_SHA}" ]; then
  echo "❌ not in gitlab pipeline"
  exit 1
fi

docker-compose --file ./docker/compose/prod/docker-compose.yml config
docker-compose --file ./docker/compose/prod/docker-compose.yml build --quiet --force-rm -- webservice-api webservice-ssr
docker-compose --file ./docker/compose/prod/docker-compose.yml up --remove-orphans --quiet-build --quiet-pull --detach

echo "================================================================="
echo " PAGESPEED"
echo " ➔ https://pagespeed.web.dev/analysis?url=https://${COMPOSE_DOMAIN_SSR}"
echo "================================================================="
echo " DEPLOY"
echo " ✔️ https://${COMPOSE_DOMAIN_SSR}"
echo " COMPOSE_LOGGER=${COMPOSE_LOGGER}"
echo "================================================================="

#!/bin/sh
set -e

docker-compose --file ./docker/compose/dev/docker-compose.yml config
docker-compose --file ./docker/compose/dev/docker-compose.yml build --quiet --force-rm -- webservice-api webservice-ssr
#docker-compose --file ./docker/compose/dev/docker-compose.yml build --quiet --force-rm -- webservice-redis webservice-api webservice-ssr
docker-compose --file ./docker/compose/dev/docker-compose.yml up --remove-orphans --quiet-build --quiet-pull --detach
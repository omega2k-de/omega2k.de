#!/bin/sh
set -e

if [ -z "${DOCKER_PREVIEW_TOKEN}" ]; then
  echo "❌ not in gitlab pipeline"
  exit 1
fi

wget "--header=User-Agent:${DOCKER_PREVIEW_TOKEN}" -O- http://172.16.32.4/pihole-domains/add/${COMPOSE_DOMAIN_SSR}
wget "--header=User-Agent:${DOCKER_PREVIEW_TOKEN}" -O- http://172.16.32.4/pihole-domains/add/${COMPOSE_DOMAIN_API}

echo "================================================================="
echo " REDIS"
echo " ➔ redis://${COMPOSE_REDIS_USERNAME}:${COMPOSE_REDIS_PASSWORD}@${COMPOSE_DOMAIN_REDIS}:${COMPOSE_PORT_REDIS}"
echo "================================================================="
echo " DYNDNS"
echo " ➔ http://172.16.32.4/pihole-domains/add/${COMPOSE_DOMAIN_SSR}"
echo " ➔ http://172.16.32.4/pihole-domains/add/${COMPOSE_DOMAIN_API}"
echo "================================================================="
echo " PAGESPEED"
echo " ➔ https://pagespeed.web.dev/analysis?url=https://${COMPOSE_DOMAIN_SSR}"
echo "================================================================="
echo " DEPLOY"
echo " ✔️ https://${COMPOSE_DOMAIN_SSR}"
echo " COMPOSE_LOGGER=${COMPOSE_LOGGER}"
echo "================================================================="
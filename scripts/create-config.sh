#!/bin/sh
set -e

CONFIG_PARAMS=./libs/core/src/lib/core/config/app.config-params.ts
WEBMANIFEST=./apps/www/public/manifest.webmanifest
CONFIG_ENV="${ENV_FILE:-.local.env}"
ROBOTS_TXT=./apps/www/public/robots.txt
APP_INDEX=./apps/www/src/index.html

DEFAULT_SSL="true"
DEFAULT_VERSION="0.42.83"
DEFAULT_SSR_PORT="4200"
DEFAULT_SSR_HOST="www.omega2k.de.o2k"
DEFAULT_API_PORT="42080"
DEFAULT_API_HOST="api.omega2k.de.o2k"
DEFAULT_REDIS_PORT="46379"
DEFAULT_REDIS_HOST="redis.omega2k.de.o2k"
DEFAULT_LOGGER="DEBUG"
DEFAULT_SOCKET="wss://api.omega2k.de.o2k:42080"
DEFAULT_API="https://api.omega2k.de.o2k:42080"
DEFAULT_URL="https://www.omega2k.de.o2k:4200"
DEFAULT_REDIS="redis://app:app@redis.omega2k.de.o2k:46379"

DEFAULT_WSS_PING="1_000"
DEFAULT_WSS_HEARTBEAT="5_000"
DEFAULT_WSS_HEALTH="10_000"
DEFAULT_WSS_FPS="15"

VAPID_PUBLIC_KEY="BINsbtyhXAMM_4NNO1QuIyfgkVjnOlrKQCXwU1XIoaPbseXecYUCA7-3MPq2EJ2XjJki_4pSqFzqpk1ZbNUgQrQ"
VAPID_PRIVATE_KEY="4rG4xGaLqs-Au7tTZNbTNNrCySalxszcDC0EAeAYuss"
VAPID_SUBJECT="mailto:root@omega2k.de"

HASH="null"
NONCE="null"
NONCE_NG=""
HASH_NG="[HASH]"

if [ -n "$CI_COMMIT_SHORT_SHA" ]; then
#  RND16HEX="$(openssl rand -hex 8)"
  HASH="\"${CI_COMMIT_SHORT_SHA}\""
  HASH_NG="${CI_COMMIT_SHORT_SHA}"
#  NONCE="\"${CI_COMMIT_SHORT_SHA}${RND16HEX}\""
#  NONCE_NG="${CI_COMMIT_SHORT_SHA}${RND16HEX}"
  NONCE="\"2ebccb008e1ef5ddae8016ee\""
  NONCE_NG="2ebccb008e1ef5ddae8016ee"
fi

echo "import { ConfigInterface } from '../interfaces/config.interface';\n" > "${CONFIG_PARAMS}"
printf "export const APP_CONFIG: ConfigInterface = {
  ssl: %s,
  version: '%s',
  ssr_port: %s,
  ssr_host: '%s',
  api_port: %s,
  api_host: '%s',
  redis_port: %s,
  redis_host: '%s',
  logger: '%s',
  socket: '%s',
  api: '%s',
  url: '%s',
  redis: '%s',
  hash: %s,
  nonce: %s,
  wsServer: {
    ping: %s,
    heartbeat: %s,
    health: %s,
    fps: %s,
  },
};
" \
  "${SSL:-${DEFAULT_SSL}}" \
  "${APP_VERSION:-${DEFAULT_VERSION}}" \
  "${COMPOSE_PORT_SSR:-${DEFAULT_SSR_PORT}}" \
  "${COMPOSE_DOMAIN_SSR:-${DEFAULT_SSR_HOST}}" \
  "${COMPOSE_PORT_API:-${DEFAULT_API_PORT}}" \
  "${COMPOSE_DOMAIN_API:-${DEFAULT_API_HOST}}" \
  "${COMPOSE_PORT_REDIS:-${DEFAULT_REDIS_PORT}}" \
  "${COMPOSE_DOMAIN_REDIS:-${DEFAULT_REDIS_HOST}}" \
  "${COMPOSE_LOGGER:-${DEFAULT_LOGGER}}" \
  "${COMPOSE_SOCKET:-${DEFAULT_SOCKET}}" \
  "${COMPOSE_API:-${DEFAULT_API}}" \
  "${COMPOSE_URL:-${DEFAULT_URL}}" \
  "${COMPOSE_REDIS:-${DEFAULT_REDIS}}" \
  "${HASH}" \
  "${NONCE}" \
  "${COMPOSE_WSS_PING:-${DEFAULT_WSS_PING}}" \
  "${COMPOSE_WSS_HEARTBEAT:-${DEFAULT_WSS_HEARTBEAT}}" \
  "${COMPOSE_WSS_HEALTH:-${DEFAULT_WSS_HEALTH}}" \
  "${COMPOSE_WSS_FPS:-${DEFAULT_WSS_FPS}}" >> "${CONFIG_PARAMS}"

echo "SSL=${SSL:-${DEFAULT_SSL}}" > "${CONFIG_ENV}"
echo "VERSION=${APP_VERSION:-${DEFAULT_VERSION}}" >> "${CONFIG_ENV}"
echo "SSR_PORT=${COMPOSE_PORT_SSR:-${DEFAULT_SSR_PORT}}" >> "${CONFIG_ENV}"
echo "SSR_HOST=${COMPOSE_DOMAIN_SSR:-${DEFAULT_SSR_HOST}}" >> "${CONFIG_ENV}"
echo "API_PORT=${COMPOSE_PORT_API:-${DEFAULT_API_PORT}}" >> "${CONFIG_ENV}"
echo "API_HOST=${COMPOSE_DOMAIN_API:-${DEFAULT_API_HOST}}" >> "${CONFIG_ENV}"
echo "REDIS_PORT=${COMPOSE_PORT_REDIS:-${DEFAULT_REDIS_PORT}}" >> "${CONFIG_ENV}"
echo "REDIS_HOST=${COMPOSE_DOMAIN_REDIS:-${DEFAULT_REDIS_HOST}}" >> "${CONFIG_ENV}"
echo "LOGGER=${COMPOSE_LOGGER:-${DEFAULT_LOGGER}}" >> "${CONFIG_ENV}"
echo "SOCKET=${COMPOSE_SOCKET:-${DEFAULT_SOCKET}}" >> "${CONFIG_ENV}"
echo "API=${COMPOSE_API:-${DEFAULT_API}}" >> "${CONFIG_ENV}"
echo "URL=${COMPOSE_URL:-${DEFAULT_URL}}" >> "${CONFIG_ENV}"
echo "REDIS=${COMPOSE_REDIS:-${DEFAULT_REDIS}}" >> "${CONFIG_ENV}"
echo "WSS_PING=${COMPOSE_WSS_PING:-${DEFAULT_WSS_PING}}" >> "${CONFIG_ENV}"
echo "WSS_HEARTBEAT=${COMPOSE_WSS_HEARTBEAT:-${DEFAULT_WSS_HEARTBEAT}}" >> "${CONFIG_ENV}"
echo "WSS_HEALTH=${COMPOSE_WSS_HEALTH:-${DEFAULT_WSS_HEALTH}}" >> "${CONFIG_ENV}"
echo "WSS_FPS=${COMPOSE_WSS_FPS:-${DEFAULT_WSS_FPS}}" >> "${CONFIG_ENV}"
echo "NONCE=${NONCE_NG}" >> "${CONFIG_ENV}"
echo "VAPID_PUBLIC_KEY=${VAPID_PUBLIC_KEY}" >> "${CONFIG_ENV}"
echo "VAPID_PRIVATE_KEY=${VAPID_PRIVATE_KEY}" >> "${CONFIG_ENV}"
echo "VAPID_SUBJECT=${VAPID_SUBJECT}" >> "${CONFIG_ENV}"

echo "User-agent: *" > "${ROBOTS_TXT}"
echo "Disallow:" >> "${ROBOTS_TXT}"
echo "Sitemap: ${COMPOSE_URL:-${DEFAULT_URL}}/sitemap.xml" >> "${ROBOTS_TXT}"

cat "${ROBOTS_TXT}"
printf "\n"

cat "${CONFIG_ENV}"
printf "\n"

cat "${CONFIG_PARAMS}"
printf "\n"

sed -i -e "s'ngCspNonce=\"[^\"]*\"'ngCspNonce=\"${NONCE_NG}\"'g" ${APP_INDEX}
sed -i -e "s'hash=[^\"]*\"'hash=${HASH_NG}\"'g" ${WEBMANIFEST}

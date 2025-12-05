#!/bin/sh
set -eu

NETCAT_CMD="${COMPOSE_NETCAT_CMD:-nc}"
PORT_START="${COMPOSE_PORT_START:-31000}"
PORT_END="${COMPOSE_PORT_END:-33000}"
DESTINATION="${COMPOSE_DESTINATION:-172.16.32.4}"

is_port_free() {
  ! "$NETCAT_CMD" -z -w 1 "$DESTINATION" "$1" >/dev/null 2>&1
}

p="$PORT_START"
while [ "$p" -lt "$PORT_END" ]; do
  next_p=$((p + 1))
  next2_p=$((p + 2))
  next3_p=$((p + 3))
  if is_port_free "$p" && is_port_free "$next_p" && is_port_free "$next2_p" && is_port_free "$next3_p"; then
    PORT_SSR="$p"
    PORT_API="$next_p"
    PORT_REDIS="$next2_p"
    break
  fi
  p=$((p + 5))
done

if [ -z "${PORT_SSR:-}" ]; then
  echo "Kein freier Port gefunden"
  exit 1
fi

REDIS_USERNAME="app-${CI_COMMIT_SHORT_SHA:-$(date +%s)}"

if [ -n "${COMPOSE_REDIS_PASSWORD:-}" ]; then
  REDIS_PASSWORD="${COMPOSE_REDIS_PASSWORD}"
elif command -v openssl >/dev/null 2>&1; then
  REDIS_PASSWORD="$(openssl rand -base64 36 | tr -d '\n')"
elif command -v base64 >/dev/null 2>&1; then
  REDIS_PASSWORD="$(head -c 48 /dev/urandom | base64 | tr -d '\n' | cut -c1-64)"
else
  REDIS_PASSWORD="$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')"
fi

# shellcheck disable=SC2129
echo "COMPOSE_PORT_SSR=$PORT_SSR" >> build.env
echo "COMPOSE_PORT_API=$PORT_API" >> build.env
echo "COMPOSE_PORT_REDIS=$PORT_REDIS" >> build.env
echo "COMPOSE_REDIS_USERNAME=$REDIS_USERNAME" >> build.env
echo "COMPOSE_REDIS_PASSWORD=$REDIS_PASSWORD" >> build.env

export COMPOSE_PORT_SSR="$PORT_SSR"
export COMPOSE_PORT_API="$PORT_API"
export COMPOSE_PORT_REDIS="$PORT_REDIS"
export COMPOSE_REDIS_USERNAME="$REDIS_USERNAME"
export COMPOSE_REDIS_PASSWORD="$REDIS_PASSWORD"

echo "Ports: SSR=$COMPOSE_PORT_SSR API=$COMPOSE_PORT_API REDIS=$COMPOSE_PORT_REDIS"
echo "Redis-User: $COMPOSE_REDIS_USERNAME"
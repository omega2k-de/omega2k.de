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
    break
  fi
  p=$((p + 5))
done

if [ -z "${PORT_SSR:-}" ]; then
  echo "Kein freier Port gefunden"
  exit 1
fi

# shellcheck disable=SC2129
echo "COMPOSE_PORT_SSR=$PORT_SSR" >> build.env
echo "COMPOSE_PORT_API=$PORT_API" >> build.env

export COMPOSE_PORT_SSR="$PORT_SSR"
export COMPOSE_PORT_API="$PORT_API"

echo "Ports: SSR=$COMPOSE_PORT_SSR API=$COMPOSE_PORT_API"

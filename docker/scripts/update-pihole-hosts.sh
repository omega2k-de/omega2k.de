#!/bin/bash

ACTION="$1"
DOMAIN="$2"
IP="${3:-172.16.32.4}"
PIHOLE="pihole.omega2k.de"
TOKEN="fZfdGKcxenoUSQ5CX5x1nBKED8pn5omg08Qjrj/hY80="

if [ -z "$DOMAIN" ]; then
  echo "❌  Domain name is required"
  exit 1
fi

if [ "$ACTION" != "add" ] && [ "$ACTION" != "remove" ]; then
  echo "❌  Invalid action. Use 'add' or 'remove'"
  exit 1
fi

SESSION=$(curl -s -X POST "https://${PIHOLE}/api/auth" -H "accept: application/json" -H "content-type: application/json" --data "{\"password\":\"${TOKEN}\"}")
SID=$(echo "$SESSION" | jq -r '.session.sid')
CSRF=$(echo "$SESSION" | jq -r '.session.csfr')

if [ -z "$SID" ]; then
  echo "❌  Failed to get session SID from ${PIHOLE}"
  exit 1
fi

if [ "$ACTION" == "remove" ]; then
    curl -s -X DELETE "https://${PIHOLE}/api/config/dns/hosts/${IP}%20${DOMAIN}?sid=${SID}" -H "X-CSRF-Token: ${CSRF}" -H "accept: application/json" -H "content-type: application/json" >/dev/null 2>&1
else
    curl -s -X PUT "https://${PIHOLE}/api/config/dns/hosts/${IP}%20${DOMAIN}?sid=${SID}" -H "X-CSRF-Token: ${CSRF}" -H "accept: application/json" -H "content-type: application/json" >/dev/null 2>&1
fi

curl -s -X DELETE "https://${PIHOLE}/api/auth?sid=${SID}" >/dev/null 2>&1

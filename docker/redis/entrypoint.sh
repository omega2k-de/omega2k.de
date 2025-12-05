#!/bin/sh
set -eu

# ENV: REDIS_USERNAME / REDIS_PASSWORD (optional)
# Wenn kein Passwort gesetzt ist (z. B. Preview), generieren wir ein starkes.
REDIS_USERNAME="${REDIS_USERNAME:-app}"
if [ -z "${REDIS_PASSWORD:-}" ]; then
  # 32 zufällige Base64-Zeichen, ohne Newline
  REDIS_PASSWORD="$(head -c 48 /dev/urandom | base64 | tr -d '\n')"
  echo "INFO: Generated random REDIS_PASSWORD for preview runtime." >&2
fi
export REDIS_USERNAME REDIS_PASSWORD

ACL_FILE=/usr/local/etc/redis/users.acl

# ACL-Datei schreiben:
# - default-User deaktivieren
# - eigener User aktivieren, volles Recht, beliebige Key/Channels
cat > "${ACL_FILE}" <<EOF
user default off
user ${REDIS_USERNAME} on >${REDIS_PASSWORD} ~* &* +@all
EOF

# Sicherstellen, dass redis.conf auf diese ACL verweist (falls nicht bereits so)
# (Konfig ist in redis.conf gesetzt; hier nur sanity log)
echo "INFO: Using ACL user '${REDIS_USERNAME}' with configured permissions." >&2

# Start Redis
exec "$@"

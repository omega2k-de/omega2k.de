#!/usr/bin/env bash

# change directory to this script
cd "$( dirname -- "$( readlink -f -- "$0"; )"; )" || exit 1

mkcert -install >/dev/null 2>&1
mkcert "omega2k.de.o2k" "*.omega2k.de.o2k" "omega2k.de" "*.omega2k.de" localhost 127.0.0.1 ::1 >/dev/null 2>&1

CAROOT=$(mkcert -CAROOT)

cp "${CAROOT}/rootCA.pem" ../ssl/rootCA.pem
cp "${CAROOT}/rootCA-key.pem" ../ssl/rootCA-key.pem

mv ./*-key.pem ../ssl/sslKey.pem
mv ./*.pem ../ssl/sslCert.pem

chmod +rw ../ssl/*.*

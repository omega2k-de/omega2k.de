#!/bin/sh
set -e

mkdir -p /app/browser

cp -R /app/next/* /app/browser/

node /app/server/server.mjs
#!/bin/sh
set -e

cd "$( dirname -- "$( readlink -f -- "$0"; )"; )" || exit 1
cd ..

cp ./content.db ./dist/apps/websocket/content.db
cp ./content.db ./dist/apps/www/browser/content.db
cp ./content.db ./dist/apps/www/server/content.db
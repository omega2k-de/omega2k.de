#!/usr/bin/env bash

npm install pnpm --global
pnpm install

pnpx playwright install firefox
pnpx playwright install chromium
pnpx playwright install webkit
pnpx playwright install --force msedge
pnpx playwright install --force chrome

pnpx playwright install --with-deps

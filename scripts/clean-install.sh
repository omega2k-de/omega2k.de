#!/bin/bash

rm -rf .angular .nx coverage dist node_modules test-results tmp pre-commit.log gl-codequality.json
npm i -g pnpm
pnpm install
pnpm outdated
husky
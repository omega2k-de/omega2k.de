#!/bin/bash

CURRENT=$(git rev-parse --abbrev-ref HEAD)
git switch main && git pull --prune && git branch --format '%(refname:short) %(upstream:track)' | awk '$2 == "[gone]" { print $1 }' | xargs -r git branch -D || exit 1
git checkout ${CURRENT}
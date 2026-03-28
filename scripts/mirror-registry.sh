#!/bin/bash

cd "$( dirname -- "$( readlink -f -- "$0"; )"; )" || exit 1
cd ..

docker pull node:24.14.1-alpine3.22
docker tag node:24.14.1-alpine3.22 registry.omega2k.de/library/node:24.14.1-alpine3.22
docker push registry.omega2k.de/library/node:24.14.1-alpine3.22

docker pull docker:29-cli
docker tag docker:29-cli registry.omega2k.de/library/docker:29-cli
docker push registry.omega2k.de/library/docker:29-cli

docker pull docker:24.0.5
docker tag docker:24.0.5 registry.omega2k.de/library/docker:24.0.5
docker push registry.omega2k.de/library/docker:24.0.5

docker pull gitlab/gitlab-runner-helper:x86_64-v18.5.0
docker tag gitlab/gitlab-runner-helper:x86_64-v18.5.0 registry.omega2k.de/gitlab/gitlab-runner-helper:x86_64-v18.5.0
docker push registry.omega2k.de/gitlab/gitlab-runner-helper:x86_64-v18.5.0

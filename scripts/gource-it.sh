#!/bin/bash

cd "$( dirname -- "$( readlink -f -- "$0"; )"; )" || exit 1
cd ..

gource -1920x1080 \
  --max-files 999999 \
  --disable-progress \
  --stop-at-end \
  -s 0.25 \
  --user-scale 2 \
  --highlight-all-users \
  --output-ppm-stream - \
| ffmpeg -y \
  -r 60 \
  -f image2pipe \
  -vcodec ppm \
  -i - \
  -vcodec libx264 \
  -b:v 3000k \
  -pix_fmt yuv420p \
  gource.mp4

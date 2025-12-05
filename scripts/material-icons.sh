#!/usr/bin/env bash

FONTS_DIR=../docker/fonts
PROJECT_DIR=..
OUTPUT_DIR=$PROJECT_DIR/apps/www/public/fonts

# config
declare -a fontFiles=("MaterialSymbolsOutlined%5BFILL,GRAD,opsz,wght%5D.woff2" "MaterialSymbolsRounded%5BFILL%2CGRAD%2Copsz%2Cwght%5D.woff2")

codePoints="MaterialSymbolsOutlined%5BFILL%2CGRAD%2Copsz%2Cwght%5D.codepoints"
fontFilesGithubUrl="https://github.com/google/material-design-icons/raw/refs/heads/master/variablefont"
iconsInterface=$PROJECT_DIR/libs/core/src/lib/core/types/ui-icon.type.ts

iconDictionary=$FONTS_DIR/dictionary
unicodesFile=$FONTS_DIR/used

# check for required command installed
requiredCommands=("fonttools" "wget" "truncate")
for executable in "${requiredCommands[@]}"
do
  if ! command -v -- "${executable}" > /dev/null 2>&1; then
      echo "command '${executable}' not be found! please install first."
      exit 1
  fi
done

# change directory to this script
cd "$( dirname -- "$( readlink -f -- "$0"; )"; )" || exit 1

# get all arguments
args=("$@")

# check for dictionary file or forced update
if [ ! -f "${codePoint}" ] || [ "${args[0]}" == "update" ]; then
  echo "downloading icon-dictionary..."
  wget -O "${iconDictionary}" "${fontFilesGithubUrl}/${codePoints}" >/dev/null 2>&1
fi

# check for woff2 file or forced update
for fontFile in "${fontFiles[@]}"
do
  if [ ! -f "${FONTS_DIR}/${fontFile}" ] || [ "${args[0]}" == "update" ]; then
    echo "downloading font-file ${fontFile}..."
    wget -O "${FONTS_DIR}/${fontFile}" "${fontFilesGithubUrl}/${fontFile}" >/dev/null 2>&1
  fi
done

# prepare output for used unicodes
echo "extracting material-icons..."
truncate -s 0 "${unicodesFile}"

echo "5f-7a" >> "${unicodesFile}"
echo "30-39" >> "${unicodesFile}"

icons=$(grep "^\s\|\s'[a-z_0-9]+'" ${iconsInterface} | cut -f2 -d"'")
for icon in ${icons}
do
  hex=$(grep "^${icon}\s[0-9a-f]*$" "${iconDictionary}" | cut -f2 -d" ")
  if [ -n "${hex}" ]; then
    echo "${hex}" >> "${unicodesFile}"
  fi
done

# create subset of full font
echo "writing subset font..."
for fontFile in "${fontFiles[@]}"
do
  OUTPUT_FILE=$(echo $fontFile | sed -E 's/^MaterialSymbols([A-Za-z]+).*\.woff2$/\1\.min.woff2/g')
  fonttools subset "${FONTS_DIR}/${fontFile}" --unicodes-file="${unicodesFile}" --no-layout-closure --output-file="${FONTS_DIR}/MS${OUTPUT_FILE}" --flavor=woff2 --with-zopfli >/dev/null 2>&1
  cp "${FONTS_DIR}/MS${OUTPUT_FILE}" "${OUTPUT_DIR}"
done

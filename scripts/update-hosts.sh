#!/usr/bin/env sh

# Define some colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CLEAR='\033[0m'

# change directory to this script
cd "$( dirname -- "$( readlink -f -- "$0"; )"; )" || exit 1

# Look into hosts and check if exists
# get all apps and apis
# validate hosts list with founded api and apps list
# add entry that doesn't exists
TMP_HOSTS=$(cat /etc/hosts | grep -E "(.*\.)?omega2k\.de\.o2k")
rm -rf .tmp >/dev/null 2>&1

HOSTS_ENTRY="${1:-0.0.0.0}"
HOSTS_ENTRY="$HOSTS_ENTRY omega2k.de.o2k"

for subdomain in www wss api cdn vite
do
  HOSTS_ENTRY="$HOSTS_ENTRY $subdomain.omega2k.de.o2k"
done

echo "${HOSTS_ENTRY}" | tee -a .tmp >/dev/null 2>&1

NEW_HOSTS=$(cat .tmp | grep -E "(.*\.)?omega2k\.de\.o2k")

if [ "${NEW_HOSTS}" != "${TMP_HOSTS}" ]
then
  # remove all lines containing ".de.o2k" from /etc/hosts
  cat /etc/hosts | grep -vwE "(.*\.)?omega2k\.de\.o2k" | sudo tee /etc/hosts >/dev/null 2>&1
  cat .tmp | sudo tee -a /etc/hosts >/dev/null 2>&1

  echo ""
  echo "${YELLOW}Added\r\n${GREEN}${NEW_HOSTS}${CLEAR}"
else
  echo ""
  echo "${YELLOW}Hosts up2date${CLEAR}"
fi

rm -rf .tmp >/dev/null 2>&1

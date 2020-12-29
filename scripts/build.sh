#!/usr/bin/env bash
set -euo pipefail

# Builds the app, outputting files ready for Netlify
# Flags:
# -n: Name of the network: 'Alfajores' or 'Mainnet'

NETWORK=""

while getopts 'n:' flag; do
  case "${flag}" in
    n) NETWORK="$OPTARG" ;;
    *) echo "Unexpected option ${flag}" ;;
  esac
done

[ -z "$NETWORK" ] && echo "Need to set the NETWORK via the -n flag" && exit 1;

echo "Building app for ${NETWORK}"

# TODO run tests here

yarn run clean

# Ensure right network config 
sed -i "" "s/freeze(config.*)/freeze(config${NETWORK})/g" src/config.ts

export NODE_ENV=production 
yarn run webpack --mode production

echo "Done building app for ${NETWORK}"
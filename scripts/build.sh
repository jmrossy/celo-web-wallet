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

echo "Checking bundle integrity"
export BUNDLE_HASH=`shasum -b -a 256 dist/bundle.js | awk '{ print $1 }' | xxd -r -p | base64`
echo "Bundle hash ${BUNDLE_HASH}"
export LEDGER_BUNDLE_HASH=`shasum -b -a 256 dist/bundle-ledger.js | awk '{ print $1 }' | xxd -r -p | base64`
echo "Ledger bundle hash ${LEDGER_BUNDLE_HASH}"

echo "Updating Index.html"
sed -i "" "s|sha256-%BUNDLE_HASH%|sha256-${BUNDLE_HASH}|g" dist/index.html

echo "Updating Readme"
sed -i "" "s|bundle.js -> sha256-.*\`|bundle.js -> sha256-${BUNDLE_HASH}\`|g" README.md
sed -i "" "s|bundle-ledger.js -> sha256-.*\`|bundle-ledger.js -> sha256-${LEDGER_BUNDLE_HASH}\`|g" README.md

echo "Done building app for ${NETWORK}"
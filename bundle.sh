#!/usr/bin/env bash

cd client
yarn build
rm -rf ../server/public
mkdir ../server/public
cp -R dist/ ../server/public

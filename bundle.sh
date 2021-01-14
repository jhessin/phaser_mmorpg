#!/usr/bin/env bash

cd client
yarn build
cd ..
rm -rf server/public
mkdir server/public
cp -R client/dist/* server/public

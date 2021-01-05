#!/usr/bin/env bash

yarn build
rm -rf ../server/public
mkdir ../server/public
cp -R dist/ ../server/public

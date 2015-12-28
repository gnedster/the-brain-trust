#!/bin/bash

FOLDERS = find . -maxdepth 1 -type d \
  -not -path '*/\.*' -a \
  -not -path "./node_modules" -a \
  -not -path "."

for folder in FOLDERS
do
  cd folder
  npm test
  cd ..
done


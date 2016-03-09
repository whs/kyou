#!/bin/bash

set -euo pipefail

cd /opt/app
cp .sandstorm/service-config/config.php engine/config.php

# npm install .
# if [ ! -x `npm bin`/grunt ]; then
# 	npm install grunt-cli@0.1.13
# fi
# nodejs `npm bin`/grunt
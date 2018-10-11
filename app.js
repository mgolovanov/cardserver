'use strict';
const { spawnSync} = require('child_process');
const child = spawnSync('server.cmd', []);

#!/usr/bin/env node

var winston = require('winston');
var nconf = require('nconf');
var Codius = require('../lib/codius').Codius;
var Config = require('../lib/config').Config;

winston.cli();

// Use nconf to load command line arguments and environment variables
nconf.argv()
     .env()
     .file({ file: 'HOME/.config/codius/cli.json' });
var config = new Config(nconf.get());
var command = nconf.get('_')[0];

if (config.config.debug) {
  winston.default.transports.console.level = 'debug';
}

var codius = new Codius();
codius.load(config).then(function () {
  codius.runCommand(command);
}).catch(function (err) {
  console.error(err.stack ? err.stack : err);
  process.exit(1);
}).done();

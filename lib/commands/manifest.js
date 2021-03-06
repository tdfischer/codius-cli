var Compiler = require('codius-engine').Compiler;

var winston = require('winston');

var ManifestCommand = function (codius) {
  this.codius = codius;
};

/**
 * Generate and output the contract's fully expanded manifest.
 */
ManifestCommand.prototype.run = function () {
  var currentDir = process.cwd();

  var engineConfig = this.codius.config.getEngineConfig();

  var compiler = new Compiler(engineConfig);

  var lastManifest;
  compiler.on('file', function (event) {
    if (event.isManifest) {
      lastManifest = event.data;
    }
  });

  // TODO Add feature to also print all manifests for all submodules
  // TODO Add feature to print manifest for a specific module
  // TODO Add feature to print manifest in canonically ordered form
  // TODO Add feature to print manifest in fully minified, hashable form
  // TODO Add feature to print hash of contract and other debug information
  var contractHash = compiler.compileModule(currentDir);
  process.stdout.write(lastManifest.toString('utf-8'));
  process.stdout.write('\n');
};

exports.ManifestCommand = ManifestCommand;

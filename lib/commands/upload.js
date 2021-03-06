var Compiler = require('codius-engine').Compiler;
var FileManager = require('codius-engine').FileManager;
var Engine = require('codius-engine').Engine;

var concat = require('concat-stream');
var fs = require('fs');
var tar = require('tar-stream');
var zlib = require('zlib');
var request = require('request');
var winston = require('winston');

var UploadCommand = function (codius) {
  this.codius = codius;
};

/**
 * Upload a contract
 */
UploadCommand.prototype.run = function () {
  var currentDir = process.cwd();

  var engineConfig = this.codius.config.getEngineConfig();

  var compiler = new Compiler(engineConfig);
  var fileManager = new FileManager(engineConfig);

  var hostName = 'codius.host';
  var hostUrl = 'https://'+hostName+':2633';

  var pack = tar.pack();
  var gzip = zlib.createGzip();
  compiler.on('file', function (event) {
    if (event.name.indexOf(currentDir) !== 0) {
      throw new Error('File path does not have current directory prefix: ' + event.name);
    }
    var filename = event.name.slice(currentDir.length);
    if (filename.indexOf('/') === 0) {
      filename = filename.slice(1);
    }
    pack.entry({ name: filename }, event.data);
  });

  var contractHash = compiler.compileModule(currentDir);
  pack.finalize();
  //pack.pipe(gzip).pipe(fs.createWriteStream('test.tar.gz')); return;
  winston.info('Uploading contract '+contractHash);

  pack.pipe(gzip).pipe(request.post({
    url: hostUrl+'/contract',
    rejectUnauthorized: false
  })).on('end', function () {
    winston.info('Generating token');
    request.post({
      url: hostUrl+'/token?contract='+contractHash,
      rejectUnauthorized: false
    }, function (error, res, body) {
      body = JSON.parse(body);
      winston.info('Contract ready at https://'+body.token+'.'+hostName+':2633/');

      // TODO This is temporary
      //request(hostUrl+body.token+'/').pipe(process.stdout);
    });
  });
};

exports.UploadCommand = UploadCommand;

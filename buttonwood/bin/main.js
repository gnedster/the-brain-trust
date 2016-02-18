var app = require('../app.js');
var botManager = require('../lib/bot-manager.js');
var cron = require('../cron.js');
var fs = require('fs');
var http = require('http');
var https = require('https');
var logger = require('@the-brain-trust/logger');
var sqsListener = require('../lib/sqs-listener.js');
var rds = require('@the-brain-trust/rds');
var util = require('@the-brain-trust/utility');
require('../rds/registry'); // Load app specific models

/**
 * This is just a little dangerous since multiple applications are able to sync.
 * If we truly implement microservices, there will be multiple datastores
 * but due to time and budget constraints, there is one shared RDS.
 */
rds.sync()
  .then(botManager.init)
  .then(sqsListener.init)
  .then(cron.init)
  .catch(function(err) {
    logger.error(err);
  });

/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || '3001');
var securePort;

/**
 * Create HTTP server.
 */
var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Create HTTPS server.
 */
var httpsServer;
var httpsOptions;
if (util.isProduction())
{
  securePort = normalizePort('443'); //TODO Terence
  httpsOptions = {
    key: fs.readFileSync('/tmp/key.pem'),
    cert: fs.readFileSync('/tmp/cert.pem'),
    ca: fs.readFileSync('/tmp/ca.pem')
    //requestCert: true, //TODO Terence is the needed, I dont think so
  };
  httpsServer = https.createServer(httpsOptions, app);
  httpsServer.listen(securePort);
  httpsServer.on('error', onError);
  httpsServer.on('listening', onListening);
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  logger.debug('Listening on ' + bind);
}


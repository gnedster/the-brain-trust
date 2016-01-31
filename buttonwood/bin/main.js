var app = require('../app.js');
var http = require('http');
var botManager = require('../lib/bot-manager.js');
var sqsListener = require('../lib/sqs-listener.js');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');
require('../rds/registry'); // Load app specific models

/**
 * This is just a little dangerous since multiple applications are able to sync.
 * If we truly implement microservices, there will be multiple datastores
 * but due to time and budget constraints, there is one shared RDS.
 */
rds.sync()
.then(rds.models.Symbol.createTgrmIndex)
  .then(botManager.init)
  .then(sqsListener.init)
  .catch(function(err) {
    logger.error(err);
  });

/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || '3001');

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


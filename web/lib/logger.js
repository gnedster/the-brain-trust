/**
 * Generalized logger module
 */
var winston = require('winston');
var util = require('./util');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      level: (util.isProduction() === true) ? 'info' : 'debug',
      handleExceptions: true,
      json: false,
      prettyPrint: true,
      colorize: true
    })
  ]
});

logger.stream = {
  write: function(message, encoding){
    logger.info(message);
  }
};

module.exports = logger;
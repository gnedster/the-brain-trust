/**
 * Helper module containg utility functions.
 */
var winston = require('winston');

/**
 * Check whether or not the process is running in development
 * @return {Boolean}
 */
function isDevelopment() {
  return typeof process.env.NODE_ENV === 'undefined' ||
    process.env.NODE_ENV === 'development';
}

/**
 * Check whether or not the process is running in production (staging is
 * production-like).
 * @return {Boolean}
 */
function isProduction() {
  return process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'staging';
}

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      level: (isProduction() === true) ? 'info' : 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ]
});

logger.stream = {
  write: function(message, encoding){
    logger.info(message);
  }
};

module.exports = {
  isDevelopment: isDevelopment,
  isProduction: isProduction,
  logger: logger
};
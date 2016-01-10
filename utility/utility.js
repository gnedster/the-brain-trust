/**
 * Helper module containg utility functions.
 */

/**
 * Check whether or not the process is running in development
 * @return {Boolean}
 */
function isDevelopment() {
  return typeof process.env.NODE_ENV === 'undefined' ||
    process.env.NODE_ENV === 'development';
}

/**
 * Check whether or not the process is running in test (on Codeship)
 * @return {Boolean}
 */
function isTest() {
  return process.env.NODE_ENV === 'test';
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

/**
 * Transform Map to Object.
 * @param  {Map} map  Map to convert to object
 * @return {Object}   Transform
 */
function mapToObject(map) {
  var result = {};
  for (var kv of map.entries()) {
    result[kv[0]] = kv[1];
  }

  return result;
}

module.exports = {
  isDevelopment: isDevelopment,
  isTest: isTest,
  isProduction: isProduction,
  mapToObject: mapToObject
};

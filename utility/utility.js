/**
 * Helper module containg utility functions.
 */

/**
 * Check whether or not the process is running in development
 * @return {Boolean}
 */
function envIsDevelopment() {
  return typeof process.env.NODE_ENV === 'undefined' ||
    process.env.NODE_ENV === 'development';
}

/**
 * Check whether or not the process is running in test (on Codeship)
 * @return {Boolean}
 */
function envIsTest() {
  return process.env.NODE_ENV === 'test';
}

/**
 * Check whether or not the process is running in production (staging is
 * production-like).
 * @return {Boolean}
 */
function envIsProduction() {
  return process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'staging';
}

module.exports = {
  envIsDevelopment: envIsDevelopment,
  envIsTest: envIsTest,
  envIsProduction: envIsProduction
};

/**
 * Helper functions
 */

/**
 * Get an attachment color for a given number
 * @param  {Number} number  Number to get color for
 * @return {String}         Color name
 */
function color(number) {
   if (number === 0) {
    return '';
  }

  return number > 0 ? 'good' : 'danger';
}

/**
 * Get a positive or negative sign given a string
 * @param  {Number} number  Number to get sign for
 * @return {String}         Positive or negative isgn
 */
function sign(number) {
  if (number === 0) {
    return '';
  }

  return number > 0 ? '+' : '-';
}

/**
 * Attach a currency symbol for a given number
 * @param  {Number} number  Number to get sign for
 * @return {String}         Currency value
 */
function toCurrency(number) {
  return '$' + toFixed(number);
}

/**
 * toFixed wrapper for consistency
 * @param  {Number} number         Number to adjust
 * @param  {Number} [precision=2]  Digits to fix to
 * @return {Number}                Adjusted number
 */
function toFixed(number, precision) {
  precision = precision || 2;
  return Number.prototype.toFixed.call(number, precision);
}

/**
 * Attach a percentage
 * @param  {Number} percentage      Number to convert to percentage
 * @param  {Number} [precision=2]   Number of digits post decimal
 * @return {String}                 String representation of percentage
 */
function toPercent(number, precision) {
  precision = precision || 2;
  return (number * 100).toFixed(precision) + '%';
}

module.exports = {
  color: color,
  sign: sign,
  toCurrency: toCurrency,
  toFixed: toFixed,
  toPercent: toPercent
};

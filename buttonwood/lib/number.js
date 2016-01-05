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
 * Add spacing to number so large numbers are readable.
 * @param  {Number} number Number to adjust
 * @return {Number}        Adjusted number
 */
function addSpacing(number) {
  var parts = number.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return parts.join('.');
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
  addSpacing: addSpacing,
  color: color,
  sign: sign,
  toPercent: toPercent
};

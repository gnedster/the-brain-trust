/**
 * Force a redirect if X-Forwarded-Proto is http
 * @param  {Request}              req  Incoming request
 * @param  {Response}             res  Outgoing response
 * @param  {Function}             next Call next routing handler
 * @return {Response|undefined}        Returns a redirect response if using http
 */
module.exports = function(req, res, next) {
  var proto = req.get('X-Forwarded-Proto');

  if (proto && proto.toLowerCase() === 'http') {
   return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
};
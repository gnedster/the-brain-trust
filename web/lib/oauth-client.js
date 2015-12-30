var _ = require('lodash');
var crypto = require('crypto');
var logger = require('@the-brain-trust/logger');
var OAuth = require('oauth');
var rds = require('@the-brain-trust/rds');

/**
 * Create a OAuth2 client for OAuth. Should adhere to something like
 * https://api.slack.com/docs/oauth.
 *
 * @param {Object} application Instance of an Aplication to make
 *                             OAuth requests for.
 */
function OAuthClient(application, platform) {
  logger.debug('starting connection with platform:', JSON.stringify(platform, null, 2));
  logger.debug('for application:\n', JSON.stringify(application, null, 2));

  this.application = application;
  this.platform = platform;

  this.client = new OAuth.OAuth2(
    application.consumerKey,
    application.consumerSecret,
    platform.baseSite,
    platform.authorizePath,
    platform.accessTokenPath,
    null
  );
}

/**
 * Get an object containing a random state for the OAuth process
 * @return {Promise} Get a promise containing an object with state or an error
 */
OAuthClient.getState = function() {
  var promise = new Promise(function(resolve, reject) {
    crypto.randomBytes(12, function(err, buf) {
      var state;
      if (err) {
        reject(err);
      } else {
        state = buf.toString('hex');
        resolve({ oAuthState: state });
      }
    });
  });

  return promise;
};

/**
 * Check whether the state provided is valid
 * @param  {Request}  req   Object representing the incoming request
 * @return {Boolean}        Represents whether the state provided is valid
 */
OAuthClient.prototype.isValidState = function(req) {
  if ('session' in req && req.query && 'state' in req.query) {
    return req.session.oAuthState === req.query.state;
  }

  return false;
};

/**
 * Abstraction for getting the OAuth access token.
 * @param  {Request} redirectUri The uri that was passed back by Slack.
 * @return {Promise} A promise.
 */
OAuthClient.prototype.getOAuthAccessToken = function(req) {
  logger.info('processing OAuth2 authorize response for: ' + req.originalUrl);
  var self = this;
  var query = req.query;

  var promise = new Promise(function(resolve, reject) {
    if ('code' in query && 'state' in query) {
      var isValidState = self.isValidState(req);

      req.session.oAuthState = null; // Delete the oAuthState to prevent reuse
      if (isValidState) {
        self.client.getOAuthAccessToken(
          query.code,
          null,
          _.bind(self.processGetAuthAccessRequest, {
            application: self.application,
            platform: self.platform,
            resolve: resolve,
            reject: reject,
            req: req
          })
        );
      } else {
        reject(new Error('invalid state'));
      }
    } else {
      logger.error('an error was returned by : ',
        self.platform.name, query.error);
      reject(new Error(query.error));
    }
  });
  return promise;
};


/**
 * Process the return value of hitting the access request endpoint of
 * platform. Exposed on the prototype to allow for testing. It the
 * responsibility of the application to remove entries which are no
 * longer valid.
 * @private
 * @param  {Object} e            Always null.
 * @param  {String} accessToken  String for an access token.
 * @param  {String} refreshToken String for a refresh token.
 * @param  {Object} results      Object that is returned by authorizer.
 */
OAuthClient.prototype.processGetAuthAccessRequest =
  function(e, accessToken, refreshToken, results){
    var self = this;
    logger.debug(results);

    try {
      if (results && results.ok === true) {
        var attributes = {
          platformId: self.platform.id,
          applicationId: self.application.id,
          credentials: results
        };

        rds.models.PlatformPermission
          .create(attributes)
          .then(function(platformPermission){
            logger.info('platform-permission created.');
            self.resolve(platformPermission);
          }).catch(function(err){
            self.reject(new Error(err));
          });

      } else {
        self.reject(
          new Error(_.isUndefined(results) ? 'no response' : results.error)
          );
      }
    } catch (err) {
      self.reject(err);
    }
  };

module.exports = OAuthClient;
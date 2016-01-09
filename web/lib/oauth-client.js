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
  logger.debug('starting connection with platform:',
    JSON.stringify(platform, null, 2));
  logger.debug('for application:\n',
    JSON.stringify(application, null, 2));

  this.application = application;
  this.platform = platform;
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
 * Return oauth client based off of current credentials
 * @return {Promise} Return Promise which might contain
 *                          an instance of OAuth.OAuth2
 */
OAuthClient.prototype.getClient = function(){
  var self = this;
  var promise = new Promise(function(resolve, reject) {
    if (self.client instanceof OAuth.OAuth2) {
      resolve(self.client);
    } else {
      // Sequelize's APIs don't work too nice here, so we
      // manually search directly on the foreign keys
      rds.models.ApplicationPlatform.findOne({
        application_id: self.application.id,
        platform_id: self.platform_id
      }).then(function(instance) {
        if (instance instanceof rds.models.ApplicationPlatform.Instance &&
            instance.clientId && instance.token) {
          self.client = new OAuth.OAuth2(
            instance.clientId,
            instance.token,
            self.platform.baseSite,
            self.platform.authorizePath,
            self.platform.accessTokenPath,
            null
          );
          resolve(self.client);
        } else {
          reject(new Error('application-platform not found.'));
        }
      }).catch(function(err){
        reject(new Error(err));
      });
    }
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
        self.getClient().then(function(client){
          client.getOAuthAccessToken(
            query.code,
            null,
            // Would be nice to find a better way to access this.
            _.bind(self.processGetAuthAccessRequest, {
              application: self.application,
              platform: self.platform,
              resolve: resolve,
              reject: reject,
              req: req
            })
          );
        }).catch(function(err) {
          reject(err);
        });
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
    logger.debug('get auth results', results);

    try {
      if (results && results.ok === true) {
        // TODO: specific to Slack, needs to be removed
        rds.models.PlatformEntity
          .findOrCreate({
            where: {
              entity_id: results.team_id,
              platform_id: self.platform.id,
              kind: 'team'
            }
          })
          .then(function(tuple) {
            var platformEntity = tuple[0];

            return rds.models.ApplicationPlatformEntity
              .findOrInitialize({
                where: {
                  application_id: self.application.id,
                  platform_entity_id: platformEntity.id,
                  platform_id: self.platform.id
                }
              });
          })
          .then(function(tuple) {
            var applicationPlatformEntity = tuple[0];

            applicationPlatformEntity.credentials = results;
            return applicationPlatformEntity.save();
          })
          .then(self.resolve)
          .catch(self.reject);
      } else {
        self.reject(
          new Error(_.isUndefined(results.error) ? 'no response' : results.error)
          );
      }
    } catch (err) {
      self.reject(err);
    }
  };

module.exports = OAuthClient;

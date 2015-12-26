var _ = require('lodash');
var config = require('config');
var crypto = require('crypto');
var logger = require('./logger');
var OAuth = require('oauth');
var sequelize = require('./sequelize');
var sessionStore = require('../lib/session-store');
var sqs = require('../lib/sqs');

/**
 * Create a OAuth2 client for Slack OAuth. Should adhere to
 * https://api.slack.com/docs/oauth. Note that we don't have the authorize
 * clause abstracted since that's largely handled by the Slack button.
 * @param {Object} slackApplication Instance of a SlackApplication to make
 *                                  OAuth requests for.
 */
function SlackOAuth(slackApplication) {
  var oAuthConfig = config.get('oauth.slack');

  logger.info("starting connection with oauth:\n" +
    JSON.stringify(oAuthConfig));

  this.slackApplication = slackApplication;
  this.client = new OAuth.OAuth2(
    slackApplication.consumerKey,
    slackApplication.consumerSecret,
    oAuthConfig.baseSite,
    oAuthConfig.authorizePath,
    oAuthConfig.accessTokenPath,
    null
  );
}

/**
 * Get an object containing a random state for the OAuth process
 * @return {Promise} Get a promise containing an object with state or an error
 */
SlackOAuth.getState = function() {
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
SlackOAuth.prototype.isValidState = function(req) {
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
SlackOAuth.prototype.getOAuthAccessToken = function(req) {
  logger.info('processing OAuth2 authorize response for: ' + req.originalUrl);
  var self = this;
  var query = req.query;

  var promise = new Promise(function(resolve, reject) {
    if ('code' in query && 'state' in query) {
      if (self.isValidState(req)) {
        self.client.getOAuthAccessToken(
          query.code,
          null,
          _.bind(self.processGetAuthAccessRequest, {
            slackApplication: self.slackApplication,
            resolve: resolve,
            reject: reject,
          })
        );
      } else {
        reject(new Error('invalid state'));
      }
    } else {
      logger.error('an error was returned by Slack: ' + query.error);
      reject(new Error(query.error));
    }
  });
  return promise;
};


/**
 * Process the return value of hitting the api/oauth.access endpoint of
 * Slack. Exposed on the prototype to allow for testing. It the responsibility
 * of the application to remove entries which are no longer valid.
 * @private
 * @param  {Object} e            Always null.
 * @param  {String} accessToken  String for an access token.
 * @param  {String} refreshToken String for a refresh token.
 * @param  {Object} results      Object that is returned by Slack.
 */
SlackOAuth.prototype.processGetAuthAccessRequest =
  function(e, accessToken, refreshToken, results){
    var self = this;
    logger.debug(results);

    try {
      if (results && results.ok === true) {
        sequelize.models.SlackTeam.findOrCreate({
          where: {
            slackId: results.team_id,
            slackName: results.team_name
          }
        }).then(function(task) {
          var slackTeam = task[0];
          var attributes = {
            slackTeamId: slackTeam.id,
            slackApplicationId: self.slackApplication.id,
            accessToken: results.access_token,
            scope: results.scope,
            incomingWebhook: results.incoming_webhook,
            bot: results.incoming_webhook,
            disabled: false,
            disabledAt: null
          };

          sequelize.models.SlackPermission
            .create(attributes)
            .then(function(slackPermission){
              logger.info('slack-permission created.');
              self.resolve(slackPermission);
            }).catch(function(err){
              self.reject(new Error(err));
            });
        }).catch(function(err) {
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

module.exports = SlackOAuth;
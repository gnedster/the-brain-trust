var _ = require('lodash');
var logger = require('./util').logger;
var OAuth = require('oauth');
var sequelize = require('./sequelize');
var SlackApplication = require('../models/slack-application');
var SlackPermission = require('../models/slack-permission');
var SlackTeam = require('../models/slack-team');

/**
 * Create a OAuth2 client for Slack OAuth. Should adhere to
 * https://api.slack.com/docs/oauth. Note that we don't have the authorize
 * clause abstracted since that's largely handled by the Slack button.
 * @param {Object} slackApplication Instance of a SlackApplication to make
 *                                  OAuth requests for.
 */
function SlackOAuth(slackApplication) {
  this.slackApplication = slackApplication;
  this.client = new OAuth.OAuth2(
    slackApplication.consumerKey,
    slackApplication.consumerSecret,
    'https://slack.com/',
    'oauth/authorize',
    'api/oauth.access',
    null
  );
}

/**
 * Abstraction for getting the OAuth access token.
 * @param  {Request} redirectUri The uri that was passed back by Slack.
 * @return {Promise} A promise.
 */
SlackOAuth.prototype.getOAuthAccessToken = function(req) {
  logger.info('Processing OAuth2 authorize response for: ' + req.originalUrl);
  var self = this;
  var query = req.query;

  var promise = new Promise(function(resolve, reject) {
    if ('code' in query && 'state' in query) {
      self.client.getOAuthAccessToken(
        query.code,
        null,
        _.bind(self._processGetAuthAccessRequest, {
          slackApplication: self.slackApplication,
          resolve: resolve,
          reject: reject,
        })
      );
    } else {
      logger.error('An error was returned by Slack: ' + query.error);
      reject(new Error(query.error));
    }
  });
  return promise;
};


/**
 * Process the return value of hitting the api/oauth.access endpoint of
 * Slack. Exposed on the prototype to allow for testing.
 * @private
 * @param  {Object} e            Always null.
 * @param  {String} accessToken  String for an access token.
 * @param  {String} refreshToken String for a refresh token.
 * @param  {Object} results      Object that is returned by Slack.
 */
SlackOAuth.prototype._processGetAuthAccessRequest =
  function(e, accessToken, refreshToken, results){
    var self = this;
    logger.debug(results);

    try {
      if (results && results.ok === true) {
        SlackTeam.findOrCreate({
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

          sequelize.transaction(function(t) {
            return SlackPermission.findOne({
                attributes: ['id'],
                where: {
                  slack_team_id: slackTeam.id,
                  slack_application_id : self.slackApplication.id
                }
              }, {transaction: t})
              .then(function(slackPermission) {
                if (_.isNull(slackPermission)) {
                  return SlackPermission.create(attributes, {transaction: t});
                } else {
                  return slackPermission.update(attributes, {transaction: t});
                }
              });
            }).then(function(slackPermission){
              logger.info('SlackPermission created/updated.');
              self.resolve(slackPermission);
            }).catch(function(err){
              self.reject(new Error(err));
            });
        });
      } else {
        self.reject(new Error(results.error));
      }
    } catch(err) {
      self.reject(err);
    }
  };

module.exports = SlackOAuth;
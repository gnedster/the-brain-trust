var _ = require('lodash');
var OAuth = require('oauth');
var SlackApplication = require('../models/slack-application');
var SlackPermission = require('../models/slack-permission');
var SlackTeam = require('../models/slack-team');
var util = require('./util');
var logger = util.logger;

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
  /**
   * Helper function to find a slackPermission based off of teamId and
   * slackApplicationId.
   * @param  {String} teamId             SlackTeam slack_id
   * @param  {String} slackApplicationId SlackApplication id
   * @return {Promise}                   Promise of findOne
   */
  function findOneSlackPermission(teamId, slackApplicationId) {
    return SlackPermission.findOne({
      attributes: ['id'],
      where: {
        slack_team_id: teamId,
        slack_application_id : slackApplicationId
      }
    });
  }

  logger.info('Processing OAuth2 authorize response for: ' + req.originalUrl);
  var self = this;
  var query = req.query;

  if ('code' in query) {
    logger.info('Access was granted successfully.');

    this.client.getOAuthAccessToken(
      query.code,
      null,
      function (e, accessToken, refreshToken, results){
        logger.debug(results);

        if (results.ok === true) {
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

            findOneSlackPermission(slackTeam.id, self.slackApplication.id)
              .then(function(slackPermission) {
                if (_.isNull(slackPermission)) {
                  SlackPermission.create(attributes).then(function(){
                    logger.debug('SlackPermission created.');
                  });
                } else {
                  slackPermission.update(attributes).then(function(){
                    logger.debug('SlackPermission updated.');
                  });
                }
              });
          });
        } else {
          logger.info("Could not create SlackPermission: " + results.error);
        }
      }
    );
  } else {
    if (query.error === 'access_denied') {
      logger.info('Access was denied, disabling existing permissions, if any.');

      findOneSlackPermission(results.team_id, self.slackApplication.id)
        .then(function(slackPermission) {
          if (_.isNull(slackPermission)) { return; }

          slackPermission.update({
            disabled: true,
            disabledAt: new Date()
          });
        }
      );
    } else {
      logger.info('An error was returned by Slack: ' + query.error);
    }
  }
};

module.exports = SlackOAuth;
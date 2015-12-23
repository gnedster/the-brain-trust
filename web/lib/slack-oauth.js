var url = require('url');
var _ = require('lodash');
var OAuth = require('oauth');
var SlackPermission = require('../models/slack-permission');
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
 * @param  {String} redirectUri The uri that was passed back by Slack.
 * @return {Promise} A promise.
 */
SlackOAuth.prototype.getOAuthAccessToken = function(redirectUri) {
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
      include: [{
        model: SlackTeam,
        where: { slack_id: results.team_id }
      }, {
        model: SlackApplication,
        where: { id : this.slackApplication.id }
      }]
    });
  }

  logger.info('Processing OAuth2 authorize response for ' +
    this.slackApplication.name
  );

  var urlObj = url.parse(redirectUri),
      query = urlObj.query;

  if (_.isUndefined(query.error)) {
    logger.info('Access was granted successfully.');

    this.client.getOAuthAccessToken(
      query.code,
      {redirect_uri: redirectUri},
      function (e, accessToken, refreshToken, results){
        logger.debug(results);
        SlackTeam.findOrCreate({
          where: {
            slackId: results.team_id,
            slackName: results.team_name
          }
        }).then(function(slackTeam) {
          var attributes = {
            slackTeamId: slackTeam.id,
            slackApplicationId: this.slackApplication.id,
            accessToken: results.access_token,
            scope: results.scope,
            incomingWebhook: results.incoming_webhook,
            bot: results.incoming_webhook,
            disabled: false,
            disabledAt: null
          };

          findOneSlackPermission(results.team_id, this.slackApplication.id)
            .then(function(slackPermission) {
              if (_.isUndefined(slackPermission)) {
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
      }
    );
  } else {
    if (query.error === 'access_denied') {
      logger.info('Access was denied, disabling existing permissions, if any.');

      findOneSlackPermission(results.team_id, this.slackApplication.id)
        .then(function(slackPermission) {
          if (_.isUndefined(slackPermission)) { return; }

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
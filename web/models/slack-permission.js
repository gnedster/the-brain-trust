var _ = require('lodash');
var logger = require('../lib/logger');
var Sequelize = require('sequelize');
var sequelize = require('../lib/sequelize');
var sqs = require('../lib/sqs');

/**
 * Send a message to SQS indicating an alteration to SlackPermission
 * @param  {Model}  instance  Instance of the altered SlackPermission
 * @param  {Object} options   Standard sequelize hook options
 */
function sendSQSMessage(instance, options) {
  logger.info('Sending message to SQS.');
  sqs.sendInstanceMessage(
    'slack-application',
    'SlackPermission changed',
    instance);
}

/**
 * The permissions granted by Slack teams for a given application.
 * @type {Model}
 */
var SlackPermission = sequelize.define('SlackPermission', {
  slackApplicationId: {
    type: Sequelize.INTEGER,
    allowNull : false,
    field: 'slack_application_id'
  },
  slackTeamId: {
    type: Sequelize.INTEGER,
    allowNull : false,
    field: 'slack_team_id'
  },
  accessToken: {
    type: Sequelize.STRING,
    allowNull : false,
    unique : true,
    field: 'access_token'
  },
  scope: {
    type: Sequelize.STRING,
    allowNull : false
  },
  incomingWebhook: {
    type: Sequelize.JSON,
    field: 'incoming_webhook'
  },
  bot: {
    type: Sequelize.JSON
  }
}, {
  hooks: {
    afterCreate: sendSQSMessage,
    afterUpdate: sendSQSMessage
  }
});

module.exports = SlackPermission;
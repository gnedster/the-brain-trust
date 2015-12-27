
var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

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
});

module.exports = SlackPermission;
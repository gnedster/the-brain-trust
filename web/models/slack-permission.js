var Sequelize = require('sequelize');
var sequelize = require('../lib/sequelize');

/**
 * The permissions granted by Slack teams for a given application.
 * @type {Model}
 */
var SlackPermission = sequelize.define('SlackPermission', {
  slackTeamId: {
    type: Sequelize.INTEGER,
    field: 'slack_team_id',
    allowNull : false
  },
  slackApplicationId: {
    type: Sequelize.INTEGER,
    field: 'slack_application_id',
    allowNull : false
  },
  accessToken: {
    type: Sequelize.STRING,
    field: 'access_token'
  },
  scope: {
    type: Sequelize.STRING,
    field: 'scope'
  },
  incomingWebhook: {
    type: Sequelize.JSON,
    field: 'incoming_webhook'
  },
  bot: {
    type: Sequelize.JSON,
    field: 'bot'
  },
  disabled: {
    type: Sequelize.BOOLEAN,
    field: 'disabled',
    defaultValue: false
  },
  disabledAt: {
    type: Sequelize.DATE,
    field: 'disabled_at'
  }
}, {
  freezeTableName: true
});

module.exports = SlackPermission;
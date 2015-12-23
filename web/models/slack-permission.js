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
    field: 'access_token',
    allowNull : false,
    unique : true
  },
  scope: {
    type: Sequelize.STRING,
    field: 'scope',
    allowNull : false
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
  freezeTableName: true,
  instanceMethods: {
    disable: function(slackPermission, done) {
      slackPermission.update({
        disabled: true,
        disabledAt: new Date()
      }).then(function(slackPermission){
        done();
      });
    }
  }
});

module.exports = SlackPermission;
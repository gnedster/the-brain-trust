var Sequelize = require('sequelize');
var SlackPermission = require('./slack-permission');
var SlackApplication = require('./slack-application');
var sequelize = require('../lib/sequelize');

/**
 * A Slack Team.
 * @type {Model}
 */
var SlackTeam = sequelize.define('SlackTeam', {
  slackId: {
    type: Sequelize.STRING,
    field: 'slack_id'
  },
  slackName: {
    type: Sequelize.STRING,
    field: 'slack_name'
  }
}, {
  freezeTableName: true
});

SlackTeam.belongsToMany(SlackApplication, {
  through: SlackPermission,
  otherKey: 'slack_application_id',
  foreignKey: 'slack_team_id'
});

module.exports = SlackTeam;
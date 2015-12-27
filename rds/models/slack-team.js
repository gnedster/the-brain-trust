var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

/**
 * A Slack Team.
 * @type {Model}
 */
var SlackTeam = sequelize.define('SlackTeam', {
  slackId: {
    type: Sequelize.STRING,
    allowNull : false,
    field: 'slack_id',
    unique: true
  },
  slackName: {
    type: Sequelize.STRING,
    allowNull : false,
    field: 'slack_name'
  }
});

module.exports = SlackTeam;
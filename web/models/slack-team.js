var Sequelize = require('sequelize');
var sequelize = require('../lib/sequelize');

/**
 * A Slack Team.
 * @type {Model}
 */
var SlackTeam = sequelize.define('SlackTeam', {
  slackId: {
    type: Sequelize.STRING,
    field: 'slack_id',
    allowNull : false
  },
  slackName: {
    type: Sequelize.STRING,
    field: 'slack_name',
    allowNull : false
  }
}, {
  freezeTableName: true
});


module.exports = SlackTeam;
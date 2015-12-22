var Sequelize = require('sequelize');
var sequelize = require('../lib/sequelize');

var Team = sequelize.define('Team', {
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

Team.hasMany(Permission);

module.exports = Team;
var SlackApplication = require('./slack-application');
var SlackTeam = require('./slack-team');
var SlackPermission = require('./slack-permission');

SlackTeam.hasMany(SlackPermission, {
  foreignKey: 'slack_team_id'
});

SlackApplication.hasMany(SlackPermission, {
  foreignKey: 'slack_application_id'
});

module.exports = {
  SlackApplication: SlackApplication,
  SlackTeam: SlackTeam,
  SlackPermission: SlackPermission
};

var SlackApplication = require('./slack-application');
var SlackTeam = require('./slack-team');
var SlackPermission = require('./slack-permission');

SlackTeam.hasMany(SlackPermission, {
  foreignKey: 'team_id'
});

SlackApplication.hasMany(SlackPermission, {
  foreignKey: 'application_id'
});

module.exports = {
  SlackApplication: SlackApplication,
  SlackTeam: SlackTeam,
  SlackPermission: SlackPermission
};

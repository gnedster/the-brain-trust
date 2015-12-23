var SlackApplication = require('./slack-application');
var SlackTeam = require('./slack-team');
var SlackPermission = require('./slack-permission');

SlackPermission.hasMany(SlackTeam, {
  foreignKey: 'team_id'
});

SlackPermission.hasMany(SlackApplication, {
  foreignKey: 'application_id'
});

module.exports = {
  SlackApplication: SlackApplication,
  SlackTeam: SlackTeam,
  SlackPermission: SlackPermission
};

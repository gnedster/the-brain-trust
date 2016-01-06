var Application = require('./application');
var ApplicationPlatform = require('./application-platform');
var ApplicationPlatformEntity = require('./application-platform-entity');
var Event = require('./event');
var Platform = require('./platform');
var User = require('./user');

Application.hasMany(ApplicationPlatform, {
  foreignKey: 'application_id'
});

Platform.hasMany(ApplicationPlatform, {
  foreignKey: 'platform_id'
});

Application.hasMany(ApplicationPlatformEntity, {
  foreignKey: 'application_id'
});

Platform.hasMany(ApplicationPlatformEntity, {
  foreignKey: 'platform_id'
});

module.exports = {
  Application: Application,
  ApplicationPlatform: ApplicationPlatform,
  ApplicationPlatformEntity: ApplicationPlatformEntity,
  Event: Event,
  Platform: Platform,
  User: User
};

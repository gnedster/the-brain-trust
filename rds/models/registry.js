var Application = require('./application');
var ApplicationPlatform = require('./application-platform');
var ApplicationPlatformEntity = require('./application-platform-entity');
var Platform = require('./platform');

Application.hasMany(ApplicationPlatform, {
  foreignKey: 'application_id'
});

Platform.hasMany(ApplicationPlatform, {
  foreignKey: 'application_id'
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
  Platform: Platform
};

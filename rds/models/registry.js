var Application = require('./application');
var ApplicationPlatform = require('./application-platform');
var ApplicationPlatformEntity = require('./application-platform-entity');
var Event = require('./event');
var Platform = require('./platform');
var PlatformEntity = require('./platform-entity');
var User = require('./user');

Application.hasMany(ApplicationPlatform, {
  foreignKey: 'application_id'
});

Platform.hasMany(ApplicationPlatform, {
  foreignKey: 'platform_id'
});

ApplicationPlatform.belongsTo(Application, {
  foreignKey: 'application_id'
});

ApplicationPlatform.belongsTo(Platform, {
  foreignKey: 'platform_id'
});

Application.hasMany(ApplicationPlatformEntity, {
  foreignKey: 'application_id'
});

Platform.hasMany(ApplicationPlatformEntity, {
  foreignKey: 'platform_id'
});

ApplicationPlatformEntity.belongsTo(Application, {
  foreignKey: 'application_id'
});

ApplicationPlatformEntity.belongsTo(Platform, {
  foreignKey: 'platform_id'
});

PlatformEntity.belongsTo(Platform, {
  foreign_key: 'platform_id',
  allowNull: false
});

PlatformEntity.belongsTo(User, {
  foreign_key: 'user_id'
});

PlatformEntity.hasMany(ApplicationPlatformEntity, {
  foreign_key: 'platform_entity_id'
});

module.exports = {
  Application: Application,
  ApplicationPlatform: ApplicationPlatform,
  ApplicationPlatformEntity: ApplicationPlatformEntity,
  Event: Event,
  PlatformEntity: PlatformEntity,
  Platform: Platform,
  User: User
};

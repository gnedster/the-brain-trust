var Application = require('./application');
var ApplicationPlatform = require('./application-platform');
var ApplicationPlatformEntity = require('./application-platform-entity');
var ApplicationUser = require('./application-user');
var Event = require('./event');
var Platform = require('./platform');
var PlatformEntity = require('./platform-entity');
var Role = require('./role');
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

ApplicationPlatformEntity.belongsTo(PlatformEntity, {
  foreignKey: 'platform_entity_id'
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

PlatformEntity.hasOne(PlatformEntity, {
  as: 'Parent',
  foreignKey: 'parent_id'
});

Application.hasMany(ApplicationUser, {
  foreignKey: 'application_id'
});

User.hasMany(ApplicationUser, {
  foreignKey: 'user_id'
});

ApplicationUser.belongsTo(Application, {
  foreign_key: 'application_id'
});

ApplicationUser.belongsTo(User, {
  foreign_key: 'user_id'
});

ApplicationUser.belongsTo(Role, {
  foreign_key: 'role_id',
  allowNull: false
});

Role.hasMany(ApplicationUser, {
  foreign_key: 'role_id'
});

module.exports = {
  Application: Application,
  ApplicationPlatform: ApplicationPlatform,
  ApplicationPlatformEntity: ApplicationPlatformEntity,
  ApplicationUser: ApplicationUser,
  Event: Event,
  PlatformEntity: PlatformEntity,
  Platform: Platform,
  User: User
};

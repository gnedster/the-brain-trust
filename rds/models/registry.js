var Application = require('./application');
var Platform = require('./platform');
var PlatformPermission = require('./platform-permission');

Application.hasMany(PlatformPermission, {
  foreignKey: 'application_id'
});

Platform.hasMany(PlatformPermission, {
  foreignKey: 'platform_id'
});

module.exports = {
  Application: Application,
  Platform: Platform,
  PlatformPermission: PlatformPermission
};

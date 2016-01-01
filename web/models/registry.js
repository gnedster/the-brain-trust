/**
 * Any further updated to sequelize models not provided by the rds module
 * should be collected here.
 */
var ApplicationPlatformEntity = require('./application-platform-entity');
var User = require('./user');

module.exports = {
  ApplicationPlatformEntity: ApplicationPlatformEntity,
  User: User
};

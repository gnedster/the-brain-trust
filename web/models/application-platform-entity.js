var mailers = require('../mailers/registry');
var rds = require('@the-brain-trust/rds');


rds.models.ApplicationPlatformEntity
  .hook('afterCreate', function(applicationPlatformEntity, options) {
    mailers.newAuthorization(applicationPlatformEntity);
  })
  .hook('afterUpdate', function(applicationPlatformEntity, options) {
    mailers.newAuthorization(applicationPlatformEntity);
  });


module.exports = {
  ApplicationPlatformEntity: rds.models.ApplicationPlatformEntity
};

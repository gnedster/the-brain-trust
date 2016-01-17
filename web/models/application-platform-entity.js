var mailers = require('../mailers/registry');
var rds = require('@the-brain-trust/rds');
var sqs = require('@the-brain-trust/sqs');


rds.models.ApplicationPlatformEntity
  .hook('afterCreate', function(applicationPlatformEntity, options) {
    sqs.sendInstanceMessage(
      'application',
      'application-platform-entity created',
      applicationPlatformEntity);

    mailers.newAuthorization(applicationPlatformEntity);
  })
  .hook('afterUpdate', function(applicationPlatformEntity, options) {
    sqs.sendInstanceMessage(
      'application',
      'application-platform-entity updated',
      applicationPlatformEntity);

    mailers.newAuthorization(applicationPlatformEntity);
  });


module.exports = {
  ApplicationPlatformEntity: rds.models.ApplicationPlatformEntity
};

var rds = require('@the-brain-trust/rds');
var sqs = require('@the-brain-trust/sqs');

rds.models.ApplicationPlatformEntity
  .hook('afterCreate', function(instance, options) {
    sqs.sendInstanceMessage(
      'application',
      'application-platform-entity created',
      instance);
  })
  .hook('afterUpdate', function(instance, options) {
    sqs.sendInstanceMessage(
      'application',
      'application-platform-entity updated',
      instance);
  });


module.exports = {
  ApplicationPlatformEntity: rds.models.ApplicationPlatformEntity
};

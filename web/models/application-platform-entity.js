var rds = require('@the-brain-trust/rds');
var sqs = require('../lib/sqs');

rds.models.ApplicationPlatformEntity
  .hook('afterCreate', function(instance, options) {
    sqs.sendInstanceMessage(
      'application',
      'application-platform-entity created',
      instance);
    }
);

module.exports = {
  ApplicationPlatformEntity: rds.models.ApplicationPlatformEntity
};

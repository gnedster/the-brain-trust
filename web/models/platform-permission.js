var rds = require('@the-brain-trust/rds');
var sqs = require('../lib/sqs');

rds.models.PlatformPermission.hook('afterCreate', function(instance, options) {
  sqs.sendInstanceMessage(
    'application',
    'platform-permission created',
    instance);
  }
);

module.exports = {
  PlatformPermission: rds.models.PlatformPermission
};
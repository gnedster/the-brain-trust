var rds = require('@the-brain-trust/rds');
var sqs = require('../lib/sqs');

rds.models.SlackPermission.hook('afterCreate', function(instance, options) {
  sqs.sendInstanceMessage(
    'slack-application',
    'slack-permission created',
    instance);
  }
);

module.exports = {
  SlackPermission: rds.models.SlackPermission
};
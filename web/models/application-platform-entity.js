var _ = require('lodash');
var rds = require('@the-brain-trust/rds');
var sqs = require('@the-brain-trust/sqs');
var mailer = require('../lib/mailer');

rds.models.ApplicationPlatformEntity
  .hook('afterCreate', function(applicationPlatformEntity, options) {
    sqs.sendInstanceMessage(
      'applicationPlatformEntity',
      'application-platform-entity created',
      applicationPlatformEntity);

    sqs.models.Application.findAll({
      where: {
        id: applicationPlatformEntity.application_id
      },
      include: [
        {
          model: sqs.models.ApplicationUser,
          include: [{
            model: sqs.models.User
          }]
        }
      ]
    }).then(function(application) {
      var to = _.map(application.ApplicationUsers, function(applicationUser) {
        return applicationUser.User.email;
      });

      mailer.sendEmail({
        Destination: {
          ToAddresses: to
        },
        Message: {
          Body: {
            Html: {
              Data: 'Testing'
            },
            Text: {
              Data: 'Testing'
            }
          },
          Subject: {
            Data: `${application.name}: New Platform Entity`
          }
        }
      });
    });


  })
  .hook('afterUpdate', function(instance, options) {
    sqs.sendInstanceMessage(
      'applicationPlatformEntity',
      'application-platform-entity updated',
      instance);
  });


module.exports = {
  ApplicationPlatformEntity: rds.models.ApplicationPlatformEntity
};

var _ = require('lodash');
var rds = require('@the-brain-trust/rds');
var sqs = require('@the-brain-trust/sqs');
var logger = require('@the-brain-trust/logger');


var path = require('path');
var templateDir   = path.join(__dirname, '..', 'templates', 'authorization');
var EmailTemplate = require('email-templates').EmailTemplate;
var template = new EmailTemplate(templateDir);
var mailer = require('../lib/mailer');

rds.models.ApplicationPlatformEntity
  .hook('afterCreate', function(applicationPlatformEntity, options) {
    sqs.sendInstanceMessage(
      'applicationPlatformEntity',
      'application-platform-entity created',
      applicationPlatformEntity);
  })
  .hook('afterUpdate', function(applicationPlatformEntity, options) {
    sqs.sendInstanceMessage(
      'applicationPlatformEntity',
      'application-platform-entity updated',
      applicationPlatformEntity);

    mailAuthorization(applicationPlatformEntity);
  });

function mailAuthorization(applicationPlatformEntity) {
  rds.models.ApplicationPlatformEntity.findById(applicationPlatformEntity.id, {
    include: [{
      model: rds.models.Application,
      include: [{
        model: rds.models.ApplicationUser,
        include: [{
          model: rds.models.User
        }]
      }]
    }, {
      model: rds.models.PlatformEntity
    }]
  }).then(function(applicationPlatformEntity) {
    template.render({
      platformEntity: applicationPlatformEntity.PlatformEntity,
      application: applicationPlatformEntity.Application
    }, function (err, results) {
      if (err) {
        logger.error(err);
      }
      var toAddresses = _.map(applicationPlatformEntity.Application.ApplicationUsers,
        function(applicationUser) {
          return applicationUser.User.email;
        });

      mailer.sendEmail({
        Destination: {
          ToAddresses: toAddresses
        },
        Message: {
          Body: {
            Html: {
              Data: results.html
            },
            Text: {
              Data: results.text
            }
          },
          Subject: {
            Data: `[${applicationPlatformEntity.Application.name}] New Authorization`
          }
        }
      });
    });

  });
}


module.exports = {
  ApplicationPlatformEntity: rds.models.ApplicationPlatformEntity
};

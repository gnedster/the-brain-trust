var _ = require('lodash');
var logger = require('@the-brain-trust/logger');
var mailer = require('../lib/mailer');
var path = require('path');
var rds = require('@the-brain-trust/rds');

var templateDir = path.join(__dirname, 'new_authorization');
var EmailTemplate = require('email-templates').EmailTemplate;
var template = new EmailTemplate(templateDir);

/**
 * Email application users that a new authorization has been added.
 * @param  {ApplicationPlatformEntity} applicationPlatformEntity
 *         ApplicationPlatformEntity to notify the user about
 * @return {Promise}                   Promise returned by mailer.
 */
function newAuthorization(applicationPlatformEntity) {
  return rds.models.ApplicationPlatformEntity.findById(
    applicationPlatformEntity.id, {
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
        return Promise.reject(err);
      }
      var toAddresses = _.map(
        applicationPlatformEntity.Application.ApplicationUsers,
        function(applicationUser) {
          return applicationUser.User.email;
        });

      return mailer.sendEmail({
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
  newAuthorization: newAuthorization
};

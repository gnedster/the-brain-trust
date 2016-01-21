var EmailTemplate = require('email-templates').EmailTemplate;
var logger = require('@the-brain-trust/logger');
var mailer = require('@the-brain-trust/mailer');
var path = require('path');
var templateDir = path.join(__dirname, 'template');
var template = new EmailTemplate(templateDir);

// Hardcoded until an alias is created
const toAddresses = [
  'edward@the-brain-trust.com',
  'terence@the-brain-trust.com'
  ];

/**
 * Notify relevant users through an email
 * @param  {String} projectName  Relevant project
 * @param  {Error}  error        Error object to report on
 * @return {Promise}             Promise returning email success or failure
 */
function notify(projectName, error) {
  return new Promise(function(resolve, reject) {
    template.render({
      error: error
    }, function (error, results) {
      if (error) {
        logger.error(error);
        reject(error);
      }

      resolve(mailer.sendEmail({
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
            Data: `[${projectName}] an error has occurred`
          }
        }
      }));
    });
  });
}

module.exports = {
  notify: notify
};

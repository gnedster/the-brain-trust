var path = require('path');
var env = process.env.NODE_ENV || 'development';

var _ = require('lodash');
var AWS = require('aws-sdk');
var config = require('config.json')
  (path.join(__dirname, 'config', env + '.json'));
var logger = require('@the-brain-trust/logger');
var util = require('@the-brain-trust/utility');

var mailer;

function getMailer() {
  if (_.isUndefined(mailer)) {
    if (util.isProduction()) {
      mailer = new AWS.SES({
        apiVersion: '2010-12-01',
        accessKeyId: process.env.SES_ACCESS_KEY_ID,
        secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
        region: process.env.SES_REGION,
        logger: logger.stream
      });
    } else {
      // Late require since nodemailer is a dev dependency.
      mailer = require('nodemailer').createTransport({
        port: 1025,
        ignoreTLS: true,
        logger: logger
      });
    }
  }

  return mailer;
}

/**
 * Translate SES sendMail params to Nodemailer
 * @param  {Object} params  Params typically used for SES
 * @return {Object}         Translated params for nodemailer
 */
function sesToNodemailer(params) {
  return {
    from: params.Source,
    to: params.Destination.ToAddresses,
    cc: params.Destination.CcAddresses,
    bcc: params.Destination.BccAddresses,
    subject: params.Message.Subject.Data,
    text: params.Message.Body.Text.Data,
    html: params.Message.Body.Html.Data
  };
}

/**
 * Abstraction for
 * {@link http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html|SES}
 * and nodemailer for development.
 *
 * @param  {Object}   params
 * @param  {Function} callback
 * @return {Promise}  Contains the results sent by SES.
 */
function sendEmail(params) {
  return new Promise(function(resolve, reject) {
    function callback(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    }

    try {
      params = _.assign(params, {
        Source: config.mailer.source
      });

      if (util.isProduction() === false) {
        params = sesToNodemailer(params);
        getMailer().sendMail(params, callback);
      } else {
        getMailer().sendEmail(params, callback);
      }
    } catch(err) {
      logger.error(err);
      reject(err);
    }
  });
}

module.exports = {
  sendEmail: sendEmail
};


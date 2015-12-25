/**
 * Provide an Amazon SQS client to write into message queues.
 * Although the SQS client gives us great flexibilty,
 * we want better management of queue url retrieval and
 * error handling so we wrap into this singleton.
 */
var _ = require('lodash');
var AWS = require('aws-sdk');
var config = require('config');
var logger = require('./logger');
var sqsConfig = config.get('sqs');
var util = require('./util');

var sqs = (function() {
  /**
   * Abstraction to get queue url.
   * @param  {String} queueName   The queue name.
   * @return {Promise}            A promise returning the queueUrl or an error.
   */
  function getQueueUrl(name) {
    var promise = new Promise(function(resolve, reject) {
      if (name in queueUrls) {
        resolve(queueUrls[name]);
      }

      sqs.getQueueUrl({
        QueueName: name
        }, function(err, data) {
        if (err) {
          logger.error(err, err.stack);
          reject(err);
        } else {
          logger.debug(JSON.stringify(data, null, 2));

          if ('QueueUrl' in data) {
            queueUrls[name] = data.QueueUrl;
            resolve(queueUrls[name]);
          }

          reject(new Error('Queue url could not be retrieved.'));
        }
      });
    });

    return promise;
  }

  /**
   * Send message to SQS with given message.
   * @param  {String} queueName    The queue name
   * @param  {String} messageBody  Message body
   * @param  {Model} payload       Additional information
   */
  function sendInstanceMessage(queueName, messageBody, payload) {
    logger.info('Sending message to SQS.');

    getQueueUrl(queueName)
      .then(function(queueUrl) {
        var params = {
          MessageBody: messageBody,
          QueueUrl: queueUrl,
          DelaySeconds: 0,
          MessageAttributes: {
            instance: {
              DataType: 'String',
              StringValue: JSON.stringify(payload)
            }
          }
        };

        sqs.sendMessage(params, function(err, data) {
          if (err) {
            logger.error(err, err.stack);
          } else {
            logger.log(data);
          }
        });
      })
      .catch(function(err) {
        logger.error('queueUrl undefined, aborting: ', err);
      });
  }

  var queueUrls = {};

  if (util.isProduction()) {
    sqsConfig.accessKeyId = process.env.SQS_ACCESS_KEY_ID;
    sqsConfig.secretAccessKey = process.env.SQS_SECRET_ACCESS_KEY;
    sqsConfig.region = process.env.SQS_REGION;
  }

  logger.debug('starting sqs connection with config:\n' +
    JSON.stringify(sqsConfig, null, 2));

  var sqs = new AWS.SQS(_.merge(sqsConfig, {
    logger: logger.stream
  }));

  return {
    sendInstanceMessage: sendInstanceMessage
  };
})();

module.exports = sqs;
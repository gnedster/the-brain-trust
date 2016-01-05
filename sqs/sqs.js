/**
 * Provide an Amazon SQS client to write into message queues.
 * Although the SQS client gives us great flexibilty,
 * we want better management of queue url retrieval and
 * error handling so we wrap into this singleton.
 */
var path = require('path');
var env = process.env.NODE_ENV || 'development';

var _ = require('lodash');
var AWS = require('aws-sdk');
var config = require('config.json')
  (path.join(__dirname, 'config', env + '.json'));
var logger = require('@the-brain-trust/logger');
var sqsConfig = config.sqs;
var util = require('@the-brain-trust/utility');

var sqs = (function() {
  /**
   * Abstraction to get queue url.
   * @param  {String} queueName   The queue name.
   * @return {Promise}            A promise returning the queueUrl or an error.
   */
  function getQueueUrl(name) {
    var promise = new Promise(function(resolve, reject) {
      if (queueUrls.has(name)) {
        return resolve(queueUrls.get(name));
      }

      awsSqs.getQueueUrl({
        QueueName: name
        }, function(err, data) {
        if (err) {
          logger.error(err, err.stack);
          reject(err);
        } else {
          logger.debug(JSON.stringify(data, null, 2));

          if ('QueueUrl' in data) {
            queueUrls.set(name, data.QueueUrl);
            resolve(queueUrls.get(name));
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
   * @return {Promise}             A promise returning the data returned or
   *                               an error for SQS.
   */
  function sendInstanceMessage(queueName, messageBody, payload) {
    logger.info('Sending message to SQS.');

    return getQueueUrl(queueName)
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

        return new Promise(function(resolve, reject) {
          awsSqs.sendMessage(params, function(err, data) {
            if (err) {
              logger.error(err, err.stack);
              reject(err);
            } else {
              logger.debug(data);
              resolve(data);
            }
          });
        });
      })
      .catch(function(err) {
        logger.error('queueUrl undefined, aborting: ', err);
      });
  }

  /**
   * Poll for messages, with the option to delete message on arrival
   * @param  {String}   queueName         The queue name
   * @param  {Boolean}  deleteOnArrival   Optional delete mechanism
   * @return {Promise}                    Promise containing data returned by
   *                                      the receiveMessage API.
   */
  function pollForMessages(queueName, deleteOnArrival) {
    logger.info('starting long poll operation.');

    return getQueueUrl(queueName)
      .then(function(queueUrl) {
        return new Promise(function(resolve, reject) {
          awsSqs.receiveMessage({
            QueueUrl: queueUrl,
            WaitTimeSeconds: 3,
            VisibilityTimeout: 10
          }, function(err, data){
            if (err) {
              reject(err);
            } else {
              resolve([queueUrl, data]);
            }
          });
        });
      })
      .then(function(tuple) {
        var queueUrl = tuple[0];
        var messages = tuple[1];
        return new Promise(function(resolve, reject) {
          if (deleteOnArrival &&
            messages.Messages instanceof Array &&
            messages.Messages.length > 0) {
            awsSqs.deleteMessageBatch({
              Entries: _.map(messages.Messages, function(message) {
                return {
                  Id: message.MessageId,
                  ReceiptHandle: message.ReceiptHandle
                };
              }),
              QueueUrl: queueUrl
            }, function(err, data){
              if (err) {
                reject(err);
              } else {
                resolve(messages);
              }
            });
          } else {
            resolve(messages);
          }
        });
      })
      .catch(function(err) {
        logger.error('queueUrl undefined, aborting: ', err);
      });
  }

  var queueUrls = new Map();

  if (util.isProduction()) {
    sqsConfig.accessKeyId = process.env.SQS_ACCESS_KEY_ID;
    sqsConfig.secretAccessKey = process.env.SQS_SECRET_ACCESS_KEY;
    sqsConfig.region = process.env.SQS_REGION;
  }

  logger.debug('starting sqs connection with config:\n' +
    JSON.stringify(sqsConfig, null, 2));

  var awsSqs = new AWS.SQS(_.merge(sqsConfig, {
    logger: logger.stream
  }));

  return {
    sendInstanceMessage: sendInstanceMessage,
    pollForMessages: pollForMessages
  };
})();

module.exports = sqs;

var path = require('path');
var env = process.env.NODE_ENV || 'development';

var _ = require('lodash');
var AWS = require('aws-sdk');
var config = require('config.json')
  (path.resolve(__dirname, '..', '..', '', 'config', env + '.json'));
var logger = require('@the-brain-trust/logger');

var sqsConfig = config.sqs;

var sqs = new AWS.SQS(_.merge(sqsConfig, {
  logger: logger.stream
}));


/**
 * Creawte
 * @param  {String}   name Name of the queue to create;
 * @param  {Function} done Callback to indicate queue creation is complete
 */
function createQueue(name, done) {
  sqs.createQueue({
      QueueName: name
    }, done);
}

module.exports = {
  createQueue: createQueue
};



/**
 * Provide an Amazon SQS client to write into a specific message queue.
 */
var _ = require('lodash');
var AWS = require('aws-sdk');
var config = require('config');
var logger = rqeuire('logger');
var util = require('./util');

var logger = util.logger;
var sqsConfig = config.get('sqs');

var keys = {};

if (util.isProduction()) {
  keys = {
    accessKeyId: process.env.SQS_ACCESS_KEY_ID,
    secretAccessKey: process.env.SQS_SECRET_ACCESS_KEY,
    region: process.env.SQS_REGION
  };
} else {
  keys = {
    accessKeyId: sqsConfig.accessKeyId,
    secretAccessKey: sqsConfig.secretAccessKey,
    region: sqsConfig.region
  };
}

var sqs = new AWS.SQS(_.merge(keys, {
  apiVersion: '2012-11-05',
  endPoint: config.get('sqs.endpoint'),
  region:
  logger: logger.stream,
  params: {
    queueUrl: config.get('sqs.endpoint')
  }
}));

module.exports = sqs;
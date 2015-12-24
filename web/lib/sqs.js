/**
 * Provide an Amazon SQS client to write into message queues.
 */
var _ = require('lodash');
var AWS = require('aws-sdk');
var config = require('config');
var util = require('./util');

var logger = require('./logger');
var sqsConfig = config.get('sqs');

var keys = {};

if (util.isProduction()) {
  sqsConfig.accessKeyId = process.env.SQS_ACCESS_KEY_ID;
  sqsConfig.secretAccessKey = process.env.SQS_SECRET_ACCESS_KEY;
  sqsConfig.region = process.env.SQS_REGION;
}

var sqs = new AWS.SQS(_.merge(sqsConfig, {
  logger: logger.stream
}));

module.exports = sqs;
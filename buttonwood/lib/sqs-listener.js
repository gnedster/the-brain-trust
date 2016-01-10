var _ = require('lodash');
var botManager = require('./bot-manager');
var logger = require('@the-brain-trust/logger');
var sqs = require('@the-brain-trust/sqs');

const queueName = 'application';

var status = 'new';

/**
 * Initialize th function to listen for SQS messages. This function
 * recursively calls itself indefinitely.
 * @param  {String}   queueName Queue name to listen to messages against
 * @return {Promise}
 */
function init() {
  status = 'active';
  return sqs.pollForMessages(queueName, true)
    .then(function(data){
      // TODO: Use data provided by queue instead of attempting to
      // initialize bots again
      if (_.get(data, 'Messages')) {
        return botManager.init();
      } else {
        return new Promise(function(resolve, reject) {
          // Artifical delay of 3 seconds
          setTimeout(resolve, 3000);
        });
      }
    })
    .then(function() {
      init(queueName);
      return Promise.resolve();
    })
    .catch(function(err) {
      status = 'error';
      logger.error(err);
    });
}

/**
 * Get the status of the SQS listener
 * @return {String}  Status
 */
function getStatus() {
  return status;
}

module.exports = {
  init: init,
  getStatus: getStatus
};

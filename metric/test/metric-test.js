/**
 * Add tests for the logger module
 */
var assert = require('assert');
var metric = require('../metric');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');

describe('metric', function(){
  before(function(done){
    rds.sync({logging: logger.stream.write})
      .then(function(){ done(); })
      .catch(function (err) {
        logger.error(err);
        done();
      });
  });

  xit('should write event', function(done){
    metric.write({
      teamId: 'T024BE7LD',
      channelId: 'C2147483705',
      userId: 'U2147483697',
      initiator: 'client x app',
      timestamp: '1358878749.000002',
      name: 'chat:buttonwood:slack:​*:*​:start_rtm',
      details: {
        text: 'Hello'
      }
    }).then(function(instance) {
      assert(instance instanceof rds.models.Event.Instance);
      done();
    });
  });
});

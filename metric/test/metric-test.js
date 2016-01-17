/**
 * Add tests for the logger module
 */
var assert = require('assert');
var factory = require('./lib/factory');
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

  it('should write event', function(done){
    metric.write({
      teamId: 'T024BE7LD',
      channelId: 'C2147483705',
      userId: 'U2147483697',
      initiator: 'client x app',
      timestamp: '1358878749.000002',
      name: 'chat:slashdot:slack:​*:*​:message',
      details: {
        text: 'Hello'
      }
    }).then(function(instance) {
      assert(instance instanceof rds.models.Event.Instance);
      done();
    });
  });

  it('should aggregate results', function(done) {
    var application;
    factory.create('application')
      .then(function(instance) {
        application = instance;
        return factory.createMany('event', [{
          name: `chat:${application.name}:slack:*:*:message`
        }, {
          name: `web:${application.name}:*:page:show:view`
        }, {
          name: `chat:${application.name}:slack:*:*:reply`
        }, {
          name: `chat:${application.name}:slack:*:*:reply`
        }]);
      }).then(function() {
        return metric.aggregate();
      }).then(function() {
        return application.reload();
      }).then(function(instance){
        assert.equal(instance.messagesReceived, 1);
        assert.equal(instance.messagesSent, 2);
        assert.equal(instance.pageViews, 1);
        done();
      }).catch(logger.error);
  });
});

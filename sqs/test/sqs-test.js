/**
 * Add tests for the rds module.
 */
var assert = require('assert');
var sqs = require('../sqs');
var specHelper = require('./lib/spec-helper');


describe('sqs', function(){
  it('should send message successfully', function(done){
    var queueName = 'fake-queue-1';
    specHelper.createQueue(queueName)
      .then(function() {
        return sqs.sendInstanceMessage(
          queueName,
          'message body',
          '{foo: bar}');
      })
     .then(function(data) {
        assert(data);
        done();
      });

  });

  it('should fail sending message for non-existent queue', function(done){
    sqs.sendInstanceMessage('non-existent-queue', 'message body', '{foo: bar}')
      .then(assert.fail)
      .catch(function(err){
        assert(err);
        done();
      });
  });

  describe('polling', function() {
    it('should receive message, delete, and receive no messages',
      function(done){
        var queueName = 'fake-queue-2';
        specHelper.createQueue(queueName)
          .then(function(){
            return sqs.sendInstanceMessage(
              queueName,
              'message body',
              '{foo: bar}');
          }).then(function() {
            return sqs.pollForMessages(queueName, true);
          }).then(function(data) {
            assert(data.Messages);
            assert.equal(data.Messages.length, 1);
          }).then(function() {
            return sqs.pollForMessages(queueName, true);
          }).then(function(data) {
            assert.equal(data.Messages, undefined);
            done();
          });
      });
  });
});

/**
 * Add tests for the rds module.
 */
var assert = require('assert');
var sqs = require('../sqs');
var specHelper = require('./lib/spec-helper');


describe('sqs', function(){
  before(function(done){
    specHelper.createQueue('fake-queue')
      .then(function() {
        done();
      });
  });

  it('should send message successfully', function(done){
    sqs.sendInstanceMessage('fake-queue', 'message body', '{foo: bar}')
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
    it('should send message, delete and consume messages', function(done){
      sqs.sendInstanceMessage('fake-queue', 'message body', '{foo: bar}')
        .then(function() {
          return sqs.pollForMessages('fake-queue', true);
        })
        .then(function(data) {
          assert(data.Messages);
          assert.equal(data.Messages.length, 1);
          done();
        });
    });
  });
});

/**
 * Add tests for the rds module.
 */
var assert = require('assert');
var error = require('../error');
var maildev = require('maildev')();

describe('mailer', function(){

  before(function(done) {
    maildev.listen(function(err){
      if (typeof err === 'undefined') {
        done();
      }
    });
  });

  it('should initialize', function(done){
    maildev.on('new', function(email){
      assert.equal(email.subject, '[error] an error has occurred');
      done();
    });

    error.notify('error', new Error('testing'));
  });
});

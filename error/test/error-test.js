/**
 * Add tests for the rds module.
 */
var assert = require('assert');
var faker = require('faker');
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
    var subject = faker.lorem.sentence();
    maildev.on('new', function(email){
      assert(subject, '[error] an error has occurred');
      done();
    });

    error.notify('error', new Error('testing'));
  });
});

/**
 * Add tests for the rds module.
 */
var assert = require('assert');
var faker = require('faker');
var mailer = require('../mailer');
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
      assert.equal(subject, email.subject);
      done();
    });

    mailer.sendEmail({
      Destination: {
        ToAddresses: [faker.internet.email()]
      },
      Message: {
        Body: {
          Html: {
            Data: faker.lorem.paragraphs()
          },
          Text: {
            Data: faker.lorem.paragraphs()
          }
        },
        Subject: {
          Data: subject
        }
      }
    });
  });
});

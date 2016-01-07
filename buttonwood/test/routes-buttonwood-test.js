/**
 * Add tests for the basic index page
 */
var app = require('../app');
var assert = require('assert');
var request = require('supertest');

describe('/buttonwood', function() {
  describe('POST commands/quote', function(){
    it('respond with OK', function(done){
      request(app)
        .post('/buttonwood/commands/quote')
        .set('Accept', 'application/json')
        .type('form')
        .send({ text: 'AAPL' })
        .end(function(err, res) {
          assert(res.body.attachments[0]);
          done();
        });
    });
  });
});

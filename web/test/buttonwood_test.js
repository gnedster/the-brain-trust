/**
 * Add tests for buttonwood
 */

var app = require('../app');
var assert = require('assert');
var config = require('config');
var db = require('../db/db');
var request = require('supertest');

describe('GET /buttonwood', function(){
  it('respond with html', function(done){
    request(app)
      .get('/buttonwood')
      .set('Accept', 'application/html')
      .expect('Content-Type', /html/)
      .expect(200, /buttonwood/, done);
  });
});

describe('GET /buttonwood/authorize', function(){
  it('responds with 404 without valid params', function(done){
    request(app)
      .get('/buttonwood/authorize')
      .set('Accept', 'application/html')
      .expect(404, /not found/, done);
  });

  xit('responds with 200, unauthorized on access_denied', function(done){
    request(app)
      .get('/buttonwood/authorize?error=access_denied&state=' +
        config.get('oauth.state'))
      .set('Accept', 'application/html')
      .expect(200, /whoa/, done);
  });

  xit('responds with 200, error on any other error', function(done){
    request(app)
      .get('/buttonwood/authorize?error=some_error&state=' +
        config.get('oauth.state'))
      .set('Accept', 'application/html')
      .expect(200, /hmm/, done);
  });

  /**
   * Fake OAuth server needs to be up.
   */
  xit('responds with 200 with valid code and state', function(done){
    request(app)
      .get('/buttonwood/authorize?code=1&state=' + config.get('oauth.state'))
      .set('Accept', 'application/html')
      .expect(200, /you\'re in/, done);
  });
});
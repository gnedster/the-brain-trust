/**
 * Add tests for buttonwood
 */

var _ = require('lodash');
var app = require('../app');
var assert = require('assert');
var config = require('config');
var db = require('../db/db');
var request = require('supertest');
var session = require('supertest-session');
var sessionStore = require('../lib/session-store');

describe('GET /buttonwood', function(){
  it('respond with html', function(done){
    request(app)
      .get('/buttonwood')
      .set('Accept', 'text/html')
      .set('Content-Type', 'text/html; charset=utf8')
      .expect('Content-Type', /html/)
      .expect(200, /buttonwood/, done);
  });
});

describe('GET /buttonwood/authorize', function(){
  it('responds with 404 without valid params', function(done){
    request(app)
      .get('/buttonwood/authorize')
      .set('Accept', 'text/html')
      .set('Content-Type', 'text/html; charset=utf8')
      .expect(404, done);
  });

  it('responds with 403, unauthorized on access_denied', function(done){
    request(app)
      .get('/buttonwood/authorize?error=access_denied&state=')
      .set('Accept', 'text/html')
      .set('Content-Type', 'text/html; charset=utf8')
      .expect(403, /whoa/, done);
  });

  it('responds with 500, error on any other error', function(done){
    request(app)
      .get('/buttonwood/authorize?error=some_error&state=')
      .set('Accept', 'text/html')
      .set('Content-Type', 'text/html; charset=utf8')
      .expect(500, /hmm/, done);
  });

  /**
   * Fake OAuth server needs to be up.
   */
  it('responds with 200 with valid code and state', function(done){
    var testSession = session(app);

    testSession
      .get('/buttonwood')
      .set('Accept', 'text/html')
      .set('Content-Type', 'text/html; charset=utf8')
      .end(function(err, res) {
        // Grab the state from the html page (not ideal)
        var state = res.text.match(/state=(\w+)/)[1];

        testSession
          .get('/buttonwood/authorize?code=1&state=' + state)
          .set('Accept', 'application/html')
          .end(function(err, res) {
            assert.equal(res.status, 200);

            // oAuthState should not be reused
            testSession
              .get('/buttonwood/authorize?code=1&state=' + state)
              .set('Accept', 'application/html')
              .expect(500, done);
          });
      });
  });
});
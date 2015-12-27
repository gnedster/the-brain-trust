/**
 * Add tests for buttonwood
 */

var app = require('../app');
var assert = require('assert');
var config = require('config');
var db = require('../db/db');
var request = require('supertest');
var session = require('supertest-session');

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
      .expect(404, done);
  });

  it('responds with 200, unauthorized on access_denied', function(done){
    request(app)
      .get('/buttonwood/authorize?error=access_denied&state=')
      .set('Accept', 'application/html')
      .expect(200, /whoa/, done);
  });

  it('responds with 200, error on any other error', function(done){
    request(app)
      .get('/buttonwood/authorize?error=some_error&state=')
      .set('Accept', 'application/html')
      .expect(200, /hmm/, done);
  });

  /**
   * Fake OAuth server needs to be up.
   */
  it('responds with 200 with valid code and state', function(done){
    var testSession = session(app);
    var reState = new RegExp('https:\/\/.*state=([\w]*)');
    var state;

    testSession
      .get('/buttonwood')
      .set('Accept', 'application/html')
      .end(function(err, res) {
        state = reState.exec(res.text).lastMatch;

        testSession
          .get('/buttonwood/authorize?code=1&state=' + state)
          .set('Accept', 'application/html')
          .expect(200, done);
      });
  });
});
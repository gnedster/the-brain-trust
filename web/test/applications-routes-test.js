/**
 * Add tests for application routes
 */

var app = require('../app');
var assert = require('assert');
var factory = require('./lib/factory');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');
var request = require('supertest');
var session = require('supertest-session');

describe('/applications', function() {
  before(function(done) {
    rds.sync({logging: logger.stream.write})
      .then(function() {factory.create('application');})
      .then(function() {factory.create('platform');})
      .then(function() {done();})
      .catch(function (err) {
        logger.error(err);
        done();
      });
  });

  describe('GET /applications/buttonwood', function(){
    it('respond with html', function(done){
      request(app)
        .get('/applications/buttonwood')
        .set('Accept', 'text/html')
        .set('Content-Type', 'text/html; charset=utf8')
        .expect('Content-Type', /html/)
        .expect(200, /buttonwood/, done);
    });
  });

  describe('GET /applications/buttonwood/changelog', function(){
    it('respond with html', function(done){
      request(app)
        .get('/applications/buttonwood/changelog')
        .set('Accept', 'text/html')
        .set('Content-Type', 'text/html; charset=utf8')
        .expect('Content-Type', /html/)
        .expect(200, /changelog/, done);
    });
  });

  describe('GET /applications/buttonwood/slack/authorize', function(){
    it('responds with 404 without valid params', function(done){
      request(app)
        .get('/applications/buttonwood/slack/authorize')
        .set('Accept', 'text/html')
        .set('Content-Type', 'text/html; charset=utf8')
        .expect(404, done);
    });

    it('responds with 403, unauthorized on access_denied', function(done){
      request(app)
        .get('/applications/buttonwood/slack/authorize?error=access_denied&state=')
        .set('Accept', 'text/html')
        .set('Content-Type', 'text/html; charset=utf8')
        .expect(403, /whoa/, done);
    });

    it('responds with 500, error on any other error', function(done){
      request(app)
        .get('/applications/buttonwood/slack/authorize?error=some_error&state=')
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
        .get('/applications/buttonwood')
        .set('Accept', 'text/html')
        .set('Content-Type', 'text/html; charset=utf8')
        .end(function(err, res) {
          // Grab the state from the html page (not ideal)
          var state = res.text.match(/state=(\w+)/)[1];

          logger.debug(state);

          testSession
            .get('/applications/buttonwood/slack/authorize?code=1&state=' + state)
            .set('Accept', 'text/html')
            .set('Content-Type', 'text/html; charset=utf8')
            .end(function(err, res) {
              assert.equal(res.status, 200);

              // oAuthState should not be reused
              testSession
                .get('/applications/buttonwood/slack/authorize?code=1&state=' + state)
                .set('Accept', 'text/html')
                .set('Content-Type', 'text/html; charset=utf8')
                .expect(500, done);
            });
        });
    });
  });
});

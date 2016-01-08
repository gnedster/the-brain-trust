/**
 * Add tests for application routes
 */

var app = require('../app');
var assert = require('assert');
var factory = require('./lib/factory');
var faker = require('faker');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');
var request = require('supertest');
var session = require('supertest-session');

describe('/applications', function() {
  before(function(done) {
    this.timeout(3000);

    rds.sync({force: true, logging: logger.stream.write})
      .then(function() {require('../models/registry');})
      .then(function() {return factory.create('application-permission');})
      .then(function() {return factory.create('user');})
      .then(function() {done();})
      .catch(function (err) {
        logger.error(err);
        done();
      });
  });

  describe('GET /applications/:name', function(){
    it('responds with html for a known application', function(done){
      request(app)
        .get('/applications/buttonwood')
        .set('Accept', 'text/html')
        .set('Content-Type', 'text/html; charset=utf8')
        .expect('Content-Type', /html/)
        .expect(200, /buttonwood/, done);
    });

    it('responds with 404 for an unknown application', function(done){
      request(app)
        .get('/applications/' + faker.finance.account())
        .set('Accept', 'text/html')
        .set('Content-Type', 'text/html; charset=utf8')
        .expect('Content-Type', /html/)
        .expect(404, done);
    });
  });

  describe('GET /applications/:name/edit`', function(){
    it('responds with 302 on unauthorized account', function(done){
      request(app)
        .get('/applications/buttonwood/edit')
        .set('Accept', 'text/html')
        .set('Content-Type', 'text/html; charset=utf8')
        .expect('Content-Type', /html/)
        .expect(404)
        .end(done);
    });

    it('responds with 200 on authorized account', function(done){
      var testSession = session(app);

      testSession
        .post('/login')
          .type('form')
          .send({ email: 'admin@test.com' })
          .send({ password: 'password' })
          .expect(302)
          .expect('Location', '/admin')
          .end(function(err, res) {
            testSession
              .get('/applications/buttonwood/edit')
              .set('Accept', 'text/html')
              .set('Content-Type', 'text/html; charset=utf8')
              .expect(200, /logout/)
              .end(function(err, res) {
                testSession
                  .post('/applications/buttonwood/edit')
                  .type('form')
                  .send({ contact: 'info@test.com' })
                  .expect(200, /edit/, done);
              });
          });
    });
  });

  describe('GET /applications/:name/changelog', function(){
    it('responds with 200', function(done){
      request(app)
        .get('/applications/buttonwood/changelog')
        .set('Accept', 'text/html')
        .set('Content-Type', 'text/html; charset=utf8')
        .expect('Content-Type', /html/)
        .expect(200, /changelog/, done);
    });
  });

  describe('GET /applications/:name/:platform_name/authorize', function(){
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
            .get('/applications/buttonwood/' +
              faker.finance.account() +
              '/authorize?code=1&state=' +
              state)
            .set('Accept', 'text/html')
            .set('Content-Type', 'text/html; charset=utf8')
            .expect(404, done);
      });
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

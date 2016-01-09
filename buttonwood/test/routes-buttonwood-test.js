/**
 * Add tests for the basic index page
 */
var app = require('../app');
var assert = require('assert');
var factory = require('./lib/factory');
var faker = require('faker');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');
var request = require('supertest');

describe('/buttonwood', function() {
  /**
   * Shared behavior for quote commands
   * @param  {Boolean} isDetailed  Test for either detailed or basic quotes
   */
  function shouldRespondToQuotes(isDetailed) {
    it('responds with OK with token', function(done){
      request(app)
        .post('/buttonwood/commands/quote' + (isDetailed ? '_detailed' : ''))
        .set('Accept', 'application/json')
        .type('form')
        .send({
          token: commandToken,
          text: 'AAPL',
          team_id: faker.random.uuid(),
          channel_id: faker.random.uuid(),
          user_id: faker.random.uuid()
        })
        .expect('Content-Type', 'application/json')
        .end(function(err, res) {
          assert(res.body.response_type);
          assert(res.body.attachments);
          done();
        });
    });

    it('responds 404 without text', function(done){
      request(app)
        .post('/buttonwood/commands/quote' + (isDetailed ? '_detailed' : ''))
        .set('Accept', 'application/json')
        .type('form')
        .send({
          token: commandToken,
          text: ''
        })
        .expect(200, /valid/, done);
    });

    it('responds 200 with malformed text', function(done){
      request(app)
        .post('/buttonwood/commands/quote' + (isDetailed ? '_detailed' : ''))
        .set('Accept', 'application/json')
        .type('form')
        .send({
          token: commandToken,
          text: '4131'
        })
        .expect(200, /valid/, done);
    });

    it('responds 404 without token', function(done){
      request(app)
        .post('/buttonwood/commands/quote' + (isDetailed ? '_detailed' : ''))
        .set('Accept', 'application/json')
        .type('form')
        .send({ text: 'AAPL' })
        .expect(404, done);
    });
  }


  var commandToken = faker.random.uuid();

  before(function(done) {
    this.timeout(3000);

    rds.sync({force: true, logging: logger.stream.write})
      .then(function() {
        return factory.create('application-permission', {
          commandToken: commandToken
        });
      })
      .then(function() {done();})
      .catch(function (err) {
        logger.error(err);
        done();
      });
  });

  describe('POST commands/quote', function(){
    shouldRespondToQuotes();
  });

  describe('POST commands/quote_detailed', function(){
    shouldRespondToQuotes(true);
  });
});

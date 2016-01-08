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
  var commandTokens = {
    quote: faker.random.uuid()
  };

  before(function(done) {
    this.timeout(3000);

    rds.sync({force: true, logging: logger.stream.write})
      .then(function() {
        return factory.create('application-permission', {
          commandTokens: commandTokens
        });
      })
      .then(function() {done();})
      .catch(function (err) {
        logger.error(err);
        done();
      });
  });

  describe('POST commands/quote', function(){
    it('responds with OK with token', function(done){
      request(app)
        .post('/buttonwood/commands/quote')
        .set('Accept', 'application/json')
        .type('form')
        .send({
          token: commandTokens.quote,
          text: 'AAPL',
          team_id: faker.random.uuid(),
          channel_id: faker.random.uuid(),
          user_id: faker.random.uuid()
        })
        .end(function(err, res) {
          assert(res.body.attachments);
          done();
        });
    });

    it('responds 404 without text', function(done){
      request(app)
        .post('/buttonwood/commands/quote')
        .set('Accept', 'application/json')
        .type('form')
        .send({
          token: commandTokens.quote,
          text: ''
        })
        .expect(404, done);
    });

    it('responds 404 without token', function(done){
      request(app)
        .post('/buttonwood/commands/quote')
        .set('Accept', 'application/json')
        .type('form')
        .send({ text: 'AAPL' })
        .expect(404, done);
    });
  });
});

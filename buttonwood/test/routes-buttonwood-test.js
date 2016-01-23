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
   * @param  {String} command  Test for either detailed or basic quotes
   */
  function shouldRespondToQuoteRequest(command) {
    command = command ? '_' + command : '';

    it('responds with OK with token', function(done){
      request(app)
        .post(`/buttonwood/commands/quote${command}`)
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
        .expect(200)
        .end(function(err, res) {
          assert(res);
          done();
        });
    });

    it('responds 404 without text', function(done){
      request(app)
        .post(`/buttonwood/commands/quote${command}`)
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
        .post(`/buttonwood/commands/quote${command}`)
        .set('Accept', 'application/json')
        .type('form')
        .send({
          token: commandToken,
          text: '$!@$@!',
          team_id: faker.random.uuid(),
          channel_id: faker.random.uuid(),
          user_id: faker.random.uuid()
        })
        .expect(200, /valid/, done);
    });
  }

  function shouldNotBeFoundWithoutToken(command) {
    command = command ? '_' + command : '';
    it('responds 404 without token', function(done){
      request(app)
        .post(`/buttonwood/commands/quote${command}`)
        .set('Accept', 'application/json')
        .type('form')
        .send({ text: 'AAPL' })
        .expect(404, done);
    });
  }


  var commandToken = faker.random.uuid();

  before(function(done) {
    this.timeout(3000);

    require('../models/registry');

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
    shouldRespondToQuoteRequest();
    shouldNotBeFoundWithoutToken();
  });

  describe('POST commands/quote_detailed', function(){
    shouldRespondToQuoteRequest('detailed');
    shouldNotBeFoundWithoutToken('detailed');
  });

  describe('POST commands/quote_add', function(){
    shouldRespondToQuoteRequest('add');
    shouldNotBeFoundWithoutToken('add');
  });

  describe('POST commands/quote_remove', function(){
    shouldRespondToQuoteRequest('remove');
    shouldNotBeFoundWithoutToken('remove');
  });

  describe('POST commands/quote_list', function(){
    it('responds with OK with token and no saved quotes', function(done){
      request(app)
        .post('/buttonwood/commands/quote_list')
        .set('Accept', 'application/json')
        .type('form')
        .send({
          token: commandToken,
          team_id: faker.random.uuid(),
          channel_id: faker.random.uuid(),
          user_id: faker.random.uuid()
        })
        .expect(200, /quote_add/, done);
    });

    it('responds with OK with token and saved quotes', function(done){
      var userId = faker.random.uuid();

      request(app)
        .post('/buttonwood/commands/quote_add')
        .set('Accept', 'application/json')
        .type('form')
        .send({
          token: commandToken,
          text: 'AAPL',
          team_id: faker.random.uuid(),
          channel_id: faker.random.uuid(),
          user_id: userId
        })
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end(function(err, res) {
          request(app)
            .post('/buttonwood/commands/quote_list')
            .set('Accept', 'application/json')
            .type('form')
            .send({
              token: commandToken,
              team_id: faker.random.uuid(),
              channel_id: faker.random.uuid(),
              user_id: userId
            })
            .expect(200)
            .end(function(err, res) {
              assert(res.body.attachments);
              done();
            });
        });
    });

    shouldNotBeFoundWithoutToken('list');
  });

  describe('POST commands/quote with 2 invalid symbols', function(){
    it('expecting not to find either invalid stocks', function(done){
      request(app)
        .post(`/buttonwood/commands/quote`)
        .set('Accept', 'application/json')
        .type('form')
        .send({
          token: commandToken,
          text: 'QQQAAA QQQAAT',
          team_id: faker.random.uuid(),
          channel_id: faker.random.uuid(),
          user_id: faker.random.uuid()
        })
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end(function(err, res) {
          assert(res);
          assert(res.text.match(/QQQAAA/));
          assert(res.text.match(/QQQAAT/));
          assert.equal(null, res.text.match(/QQQAAAQQQAAT/));
          done();
        });
    });

    it('expecting not to find either first stock and drop garbage character', function(done){
      request(app)
        .post(`/buttonwood/commands/quote`)
        .set('Accept', 'application/json')
        .type('form')
        .send({
          token: commandToken,
          text: 'QQQAAA $!@$@!',
          team_id: faker.random.uuid(),
          channel_id: faker.random.uuid(),
          user_id: faker.random.uuid()
        })
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end(function(err, res) {
          assert(res);
          assert(res.text.match(/QQQAAA/));
          assert.equal(null, res.text.match(/$!@$@!/));
          done();
        });
    });
  });
});

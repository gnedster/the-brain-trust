/**
 * Add tests for the basic index page
 */
var q = require('q');

var app = require('../app');
var factory = require('factory-girl').promisify(q);
var faker = require('faker');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');
var request = require('supertest');

describe('/', function() {
  var user;

  before(function(done) {
    rds.sync({
      force: true,
      logging: logger.stream.write
    })
      .then(function() {
        // Install project-specific hooks
        require('../models/registry');
      })
      .then(function() {
        return factory.create('user', {email: faker.internet.email()});
      })
      .then(function(instance) {
        user = instance;
        done();
      })
      .catch(function (err) {
        logger.error(err);
        done();
      });
  });

  describe('GET /', function(){
    it('respond with html', function(done){
      request(app)
        .get('/')
        .set('Accept', 'application/html')
        .expect('Content-Type', /html/)
        .expect(200, /the brain trust/)
        .expect(200, /login/, done);
    });
  });

  describe('GET /privacy-policy', function(){
    it('respond with OK', function(done){
      request(app)
        .get('/')
        .set('Accept', 'application/html')
        .expect('Content-Type', /html/)
        .expect(200, /privacy policy/, done);
    });
  });

  describe('GET /health', function(){
    it('respond with OK', function(done){
      request(app)
        .get('/health')
        .set('Accept', 'application/*')
        .expect(200, 'OK', done);
    });
  });

  describe('GET /login', function() {
    it('respond with OK', function(done){
      request(app)
        .get('/login')
        .set('Accept', 'text/html')
        .expect(200, /login/, done);
    });
  });

  describe('POST /login', function() {
    it('respond with 302 to /login on login failure', function(done){
      request(app)
        .post('/login')
        .field('email', faker.internet.email())
        .field('password', faker.internet.password())
        .set('Accept', 'text/html')
        .expect(302)
        .expect('Location', '/login')
        .end(done);
      });

    it('respond with 302 to /admin on login success', function(done){
      request(app)
        .post('/login')
        .type('form')
        .send({ email: user.email })
        .send({ password: 'password' })
        .expect(302)
        .expect('Location', '/admin')
        .end(done);
      });
  });
});

/**
 * Add tests for the basic website
 */

var app = require('../app');
var request = require('supertest');

describe('GET /', function(){
  it('respond with html', function(done){
    request(app)
      .get('/')
      .set('Accept', 'application/html')
      .expect('Content-Type', /html/)
      .expect(200, /the brain trust/, done);
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
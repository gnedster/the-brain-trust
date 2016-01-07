/**
 * Add tests for the basic index page
 */
var app = require('../app');
var request = require('supertest');

describe('/', function() {
  describe('GET /health', function(){
    it('respond with OK', function(done){
      request(app)
        .get('/health')
        .set('Accept', 'application/*')
        .expect(200, /ok/i, done);
    });
  });
});

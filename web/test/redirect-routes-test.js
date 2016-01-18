/**
 * Add tests for the redirect controller
 */
var app = require('../app');
var request = require('supertest');

describe('/redirect', function() {
  describe('GET /redirect', function(){
    it('responds with 404 on bad uri', function(done){
      request(app)
        .get('/redirect')
        .expect(404, done);
    });

     it('responds with 301 on good uri', function(done){
      var uri = 'https://the-brain-trust.com';
      request(app)
        .get(`/redirect?s=${uri}`)
        .expect('Location', uri)
        .expect(302, done);
    });
  });
});

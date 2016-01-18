/**
 * Add tests for the admin page
 */

var app = require('../app');
var request = require('supertest');

describe('/admin', function() {
  describe('GET /admin', function(){
    it('responds with 404 on unauthorized', function(done){
      request(app)
        .get('/admin')
        .set('Accept', 'application/html')
        .expect('Content-Type', /html/)
        .expect(404, done);
    });
  });
});

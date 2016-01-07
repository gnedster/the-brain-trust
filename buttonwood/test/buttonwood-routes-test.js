/**
 * Add tests for the basic index page
 */
var app = require('../app');
var request = require('supertest');

describe('/buttonwood', function() {
  describe('POST /quote', function(){
    it('respond with OK', function(done){
      request(app)
        .post('/buttonwood/quote')
        .type('form')
        .send({ text: 'AAPL' })
        .expect(200, /AAPL/i, done);
    });
  });
});

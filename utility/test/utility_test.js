/**
 * Add tests for the utility module
 */
var assert = require('assert');
var faker = require('faker');
var utility = require('../utility');

describe('utility', function(){
  before(function(){
    process.env.NODE_ENV = 'test';
  });

  it('should provide correct values for environment', function(done){
    assert(utility.isTest());
    assert.equal(utility.isProduction(), false);
    assert.equal(utility.isDevelopment(), false);
    done();
  });

  it('should convert map to object', function() {
    var map = new Map();

    map.set('a', 1);

    assert.equal(utility.mapToObject(map)['a'], 1);
  });

  it('should convert uri appropriately', function(){
    var uri = faker.internet.domainWord();
    assert(utility.getRedirectUri(uri),
      `http://localhost:3000/redirect?s=${uri}`);
  });

  after(function(){
    delete process.env.NODE_ENV;
  });
});

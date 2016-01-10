/**
 * Add tests for the utility module
 */
var assert = require('assert');
var utility = require('../utility');

describe('utility', function(){
  before(function(){
    process.env.NODE_ENV = 'test';
  });

  it('should provide correct values for environment', function(done){
    assert(utility.envIsTest());
    assert.equal(utility.envIsProduction(), false);
    assert.equal(utility.envIsDevelopment(), false);
    done();
  });

  it('should convert map to object', function() {
    var map = new Map();

    map.set('a', 1);

    assert.equal(utility.mapToObject(map)['a'], 1);
  });

  after(function(){
    delete process.env.NODE_ENV;
  });
});

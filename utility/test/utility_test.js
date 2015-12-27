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

  after(function(){
    delete process.env.NODE_ENV;
  });
});
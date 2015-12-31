/**
 * Add tests for the logger module
 */
var assert = require('assert');
var logger = require('../logger');
var winston = require('winston');

describe('logger', function(){
  it('should initialize', function(done){
    assert(logger instanceof winston.Logger);
    done();
  });
});

/**
 * Add tests for the logger module
 */
var assert = require('assert');
var rds = require('../rds');
var Sequelize = require('sequelize');

describe('rds', function(){
  it('should initialize', function(done){
    assert(rds instanceof Sequelize);
    done();
  });
});
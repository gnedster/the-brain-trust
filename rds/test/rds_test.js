/**
 * Add tests for the rds module.
 */
var assert = require('assert');
var rds = require('../rds');
var Sequelize = require('sequelize');

describe('rds', function(){
  it('should initialize', function(done){
    assert(rds instanceof Sequelize);
    assert(rds.models.Application instanceof Sequelize.Model);
    done();
  });
});
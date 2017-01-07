var _ = require('lodash');
var assert = require('assert');
var marcopolo = require('../app/marcopolo.js');
var factory = require('./lib/factory');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');

describe('marcopolo', function(){
  before(function(done) {
    this.timeout(3000);

    require('../rds/registry');

    rds.sync({force: true, logging: logger.stream.write})
      .then(function() {
        return factory.create('platform');
      })
      .then(function() {done();})
      .catch(logger.error);
  });

  it('should return valid products from string', function(done){
    var text = 'I want to buy an iphone 7';
    var expectedResult = ['an iphone 7'];
    var result = marcopolo.parseProducts(text);

    assert.equal(result.length, expectedResult.length);
    for (var i = 0, ii = result.length; i < ii; i++) {
      assert.equal(result[i], expectedResult[i]);
    }
    done();
  });

  it('should return null with no valid products in string', function(done){
    var text = 'I want to buy';
    assert(_.isEmpty(marcopolo.parseProducts(text)));
    done();
  });
});

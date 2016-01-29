var assert = require('assert');
var buttonwood = require('../app/buttonwood.js');
var factory = require('./lib/factory');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');

describe('buttonwood', function(){
  before(function(done) {
    this.timeout(3000);

    require('../rds/registry');

    rds.sync({force: true, logging: logger.stream.write})
      .then(function(){
        return rds.query('CREATE EXTENSION pg_trgm').then(function() {
          return rds.query('CREATE INDEX name_trgm_idx ON symbols USING GIN (name gin_trgm_ops)');
        });
      })
      .then(function() {
        return factory.create('symbol');
      })
      .then(function() {done();})
      .catch(logger.error);
  });

  it('should return valid symbols from string', function(done){
    var str = '$FB $12.12 $NYSE:GOOGL $123.by $1.0 $J12ELK90#$ $12345 $^GSPC $^^GSPC';
    var expectedResult = ['$FB','$NYSE:GOOGL','$123.by','$J', '$^GSPC'];
    var result = buttonwood.parseStockQuote(str);

    assert.equal(result.length, expectedResult.length);
    for (var i = 0, ii = result.length; i < ii; i++) {
      assert.equal(result[i], expectedResult[i]);
    }
    done();
  });

  it('should return null with no valid symbols in string', function(done){
    var str = '$12 asdf';
    assert.equal(buttonwood.parseStockQuote(str), null);
    done();
  });

  it('should return a symbol using ngram index', function(done) {
    rds.models.Symbol.findSymbol('microsoft').then(function(symbols) {
      assert.equal(symbols[0].ticker, 'MSFT');
      done();
    });
  });
});

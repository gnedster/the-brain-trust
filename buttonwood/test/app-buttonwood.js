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
      .then(function() {
        return factory.createMany('symbol', [{}, {
          ticker: 'MSFT.MX'
        }, {
          ticker: 'AAPL',
          name: 'Apple Inc.'
        }, {
          ticker: 'TWTR',
          name: 'Twitter'
        }]);
      })
      .then(function() {done();})
      .catch(logger.error);
  });

  it('should return valid symbols from string', function(done){
    var str = '$FB $12.12 $NYSE:GOOGL $123.by $1.0 $J12ELK90#$ $12345 $^GSPC' +
      ' $^^GSPC $$$asd$f';
    var expectedResult = ['$FB','$NYSE:GOOGL','$123.by','$J12ELK90', '$^GSPC',
      '$^^GSPC', '$asd', '$f'];
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

  describe ('matchSymbols', function() {
    it('should return a symbol using composite lookup', function(done) {
      buttonwood.matchSymbols('apple inc. msft').then(function(symbols) {
        assert.equal(symbols.valid[0], 'AAPL');
        assert.equal(symbols.valid[1], 'MSFT');
        done();
      });
    });

    it('should return a symbol using ngram index', function(done) {
      buttonwood.matchSymbols('microsoft').then(function(symbols) {
        assert.equal(symbols.valid[0], 'MSFT');
        done();
      });
    });

    it('should return a symbol using ngram index', function(done) {
      buttonwood.matchSymbols('microsoft TWTR no name').then(function(symbols) {
        assert.equal(symbols.valid[0], 'MSFT');
        assert.equal(symbols.valid[1], 'TWTR');
        assert.equal(symbols.invalid[0], 'NO');
        assert.equal(symbols.invalid[1], 'NAME');
        done();
      });
    });

    it('should return an empty value', function(done) {
      buttonwood.matchSymbols('   ').then(function(symbols) {
        assert(symbols.valid.length === 0);
        done();
      });
    });
  });
});

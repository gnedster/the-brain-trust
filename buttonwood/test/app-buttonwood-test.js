var _ = require('lodash');
var assert = require('assert');
var buttonwood = require('../app/buttonwood.js');
var factory = require('./lib/factory');
var faker = require('faker');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');

describe('buttonwood', function(){
  var platform;
  before(function(done) {
    this.timeout(3000);

    require('../rds/registry');

    rds.sync({force: true, logging: logger.stream.write})
      .then(function() {
        return factory.create('platform');
      })
      .then(function(instance) {
        platform = instance;
        return factory.createMany('symbol', [{}, {
          ticker: 'MSFT.MX'
        }, {
          ticker: 'AAPL',
          name: 'Apple Inc.'
        }, {
          ticker: 'TWTR',
          name: 'Twitter'
        }, {
        }, {
          ticker: 'TERE',
          name: 'asdf'
        }, {
          ticker: 'GOOG',
          name: 'Google'
        }]);
      })
      .then(function() {done();})
      .catch(logger.error);
  });

  it('should return valid symbols from string', function(done){
    var str = '$FB $12.12 $NYSE:GOOGL $123.by $1.0 $J12ELK90#$ $12345 $^GSPC' +
      ' $^^GSPC $$$asd$f $12k $12.45K $12l $vxc.to $<http://vxc.to|vxc.to>';
    var expectedResult = ['FB','NYSE:GOOGL','123.by','J12ELK90', '^GSPC',
      '^^GSPC', 'asd', 'f', '12l', 'vxc.to', 'vxc.to'];
    var result = buttonwood.parseStockQuote(str);

    assert.equal(result.length, expectedResult.length);
    for (var i = 0, ii = result.length; i < ii; i++) {
      assert.equal(result[i], expectedResult[i]);
    }
    done();
  });

  it('should return null with no valid symbols in string', function(done){
    var str = '$12 asdf';
    assert(_.isEmpty(buttonwood.parseStockQuote(str)));
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

    it('should return valid symbol when prepended by exchange', function(done) {
      buttonwood.matchSymbols('NDAQ:GOOG').then(function(symbols) {
        assert.equal(symbols.valid[0], 'GOOG');
        done();
      });
    });

    it('should return invalid symbol when prepended by invalid exchange', function(done) {
      buttonwood.matchSymbols('NDDAQ:TERE NDDAQ:GGGOOG').then(function(symbols) {
        assert.equal(symbols.invalid[0], 'NDDAQ:TERE');
        assert.equal(symbols.invalid[1], 'NDDAQ:GGGOOG');
        done();
      });
    });
  });

  describe('messageNews', function() {
    buttonwood.messageNews({symbols: {valid: ['MSFT', 'TWTR']}})
      .then(function(message){
        assert(message.attachments);
      });
  });

  describe('setPortfolioSummary', function() {
    it('should return a tuple on an unknown user', function(done) {
      buttonwood.setPortfolioSummary({
          platformEntity: {
            entityId: `U${faker.random.number()}`
          }
        })
        .then(function(portfolio) {
          assert(portfolio instanceof rds.models.Portfolio.Instance);
          done();
        });
    });
  });

  describe ('getPortfolioSummaries', function() {
    it('should return an empty array with no entries', function(done) {
      buttonwood.getPortfolioSummaries()
        .then(function(summaries) {
          assert(summaries);
          assert(summaries.length === 0);
          done();
        });
    });

    it('should return an object with at least one entry', function(done) {
      factory.create('portfolio')
        .then(function(portfolio) {
          return portfolio.getPlatformEntity();
        })
        .then(function(platformEntity) {
          return platformEntity.getPlatformEntity();
        })
        .then(function(platformEntity) {
          return factory.create('application-platform-entity', {
            platform_entity_id: platformEntity.id,
            platform_id: platform.id
          });
        })
        .then(function(){
          buttonwood.getPortfolioSummaries()
            .then(function(summaries) {
              assert(summaries);
              assert(summaries.length > 0);
              var summary = summaries[0];
              assert(summary.applicationPlatformEntity);
              assert(summary.platformEntity);
              assert(summary.message.attachments.length === 2);
              done();
            });
          });
      });
  });
});

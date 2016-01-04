/**
 * Add tests for the logger module
 */
var assert = require('assert');
var number = require('../lib/number');

describe('number', function(){
  it('should color', function(done){
    assert.equal(number.color(1), 'good');
    assert.equal(number.color(0), '');
    assert.equal(number.color(-123.1), 'danger');
    done();
  });

  it('should sign', function(done){
    assert.equal(number.sign(1), '+');
    assert.equal(number.sign(0), '');
    assert.equal(number.sign(-123.1), '-');
    done();
  });

  it('should toCurrency', function(done){
    assert.equal(number.toCurrency(2321.2123), '$2321.21');
    assert.equal(number.toCurrency(0.2), '$0.20');
    done();
  });

  it('should toFixed', function(done){
    assert.equal(number.toFixed(2321.2123), 2321.21);
    assert.equal(number.toFixed(0.2), 0.20);
    done();
  });


  it('should toPercent', function(done){
    assert.equal(number.toPercent(2321.2123), '232121.23%');
    assert.equal(number.toPercent(0.2), '20.00%');
    done();
  });
});



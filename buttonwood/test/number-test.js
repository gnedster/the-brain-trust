/**
 * Add tests for the number lib
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

  it('should toPercent', function(done){
    assert.equal(number.toPercent(2321.2123), '232121.23%');
    assert.equal(number.toPercent(0.2), '20.00%');
    done();
  });
});



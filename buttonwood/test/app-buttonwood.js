var buttonwood = require('../app/buttonwood.js');
var assert = require('assert');

describe('buttonwood', function(){
  it('should return valid symbols from string', function(done){
    var str = '$FB $12.12 $NYSE:GOOGL $123.by $1.0 $J12ELK90#$ $12345 $^GSPC $^^GSPC';
    var expectedResult = ['$FB','$NYSE:GOOGL','$123.by','$J', '$^GSPC'];
    var result = buttonwood.parseStockQuote(str);

    assert.equal(result.length, expectedResult.length);
    for (var i = 0; i < result.length; i++) {
      assert.equal(result[i], expectedResult[i]);
    }
    done();
  });

  it('should return null with no valid symbols in string', function(done){
    var str = '$12 asdf';
    assert.equal(buttonwood.parseStockQuote(str), null);
    done();
  });
});

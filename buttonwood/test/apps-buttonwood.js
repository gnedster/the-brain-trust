var buttonwood = require('../app/buttonwood.js');
var assert = require('assert');

describe('number', function(){
  it('find valid entry', function(done){
    var str = '$FB $12.12 $NYSE:GOOGL $123.by $1.0 $J12ELK90#$ $12345';
    assert.equal(buttonwood.parseStockQuote(str).length, 4);
    done();
  });

  it('return null due to sting not being passed in', function(done){
    var str = '$12 asdf';
    assert.equal(buttonwood.parseStockQuote(str), null);
    done();
  });
});

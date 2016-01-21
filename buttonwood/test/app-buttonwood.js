var buttonwood = require('../app/buttonwood.js');
var assert = require('assert');

describe('buttonwood', function(){
  it('should return valid entries', function(done){
    var str = '$FB $12.12 $NYSE:GOOGL $123.by $1.0 $J12ELK90#$ $12345';
    assert.equal(buttonwood.parseSymbols(str).length, 4);
    done();
  });

  it('should return null with invalid symbols', function(done){
    var str = '$12 buttonwood is great';
    assert.equal(buttonwood.parseSymbols(str), null);
    done();
  });
});

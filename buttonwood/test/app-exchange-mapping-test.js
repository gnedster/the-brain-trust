var assert = require('assert');
var exchangeMap = require('../app/exchange-mapping.js');


describe('buttonwood', function(){
  it('map to valid exchange', function(done){
    assert.equal(exchangeMap.get('NDAQ'),'NMS');
    assert.equal(exchangeMap.get('TSX'),'TOR');
    assert.equal(exchangeMap.get('SES'),'SES');
    done();
  });

  it('map to valid exchange', function(done){
    assert.equal(exchangeMap.get('NDDAQ'), undefined);
    done();
  });
});

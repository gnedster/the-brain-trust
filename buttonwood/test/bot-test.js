/**
 * Tests for the bot module
 */
var assert = require('assert');
var Bot = require('../lib/bot');

describe('Bot', function(){
  it('should create bot and listen', function(done){
    var bot;
    try {
      bot = new Bot('xoxb-16835262720-Tpn5RK1ymtSSldGuwVMv0PBm');
    } catch (err) {
      assert(false);
    }
    assert.equal(bot.listen(), bot);
    done();
  });
});

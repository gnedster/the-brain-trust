/**
 * Tests for the bot module
 */
var assert = require('assert');
var BotButtonwood = require('../bot/buttonwood');

describe('BotButtonwood', function(){
  it('should initialize buttonwood bot', function(done){
    var token = 'xoxb-16835262720-13214213213';

    assert(new BotButtonwood(token));
    done();
  });
});

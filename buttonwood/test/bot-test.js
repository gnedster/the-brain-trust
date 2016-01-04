/**
 * Tests for the bot module
 */
var assert = require('assert');
var Bot = require('../lib/bot');

describe('Bot', function(){
  it('should initialize bot', function(done){
    var token = 'xoxb-16835262720-13214213213';

    assert(new Bot(token));
    done();
  });
});

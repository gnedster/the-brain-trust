/**
 * Tests for the bot module
 */
var assert = require('assert');
var BotMarcopolo = require('../bot/marcopolo');

describe('BotMarcopolo', function(){
  it('should initialize marcopolo bot', function(done){
    var token = 'xoxb-16835262720-13214213213';

    assert(new BotMarcopolo(token));
    done();
  });
});

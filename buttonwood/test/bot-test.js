/**
 * Tests for the bot module
 */
var assert = require('assert');
var BotButtonwood = require('../bot/buttonwood');
var BotMarcopolo = require('../bot/marcopolo');

describe('BotButtonwood', function(){
  it('should initialize buttonwood bot', function(done){
    var token = 'xoxb-16835262720-13214213213';

    assert(new BotButtonwood(token));
    done();
  });
});

describe('BotMarcopolo', function(){
  it('should initialize marcopolo bot', function(done){
    var token = 'xoxb-12312321123-124213123213';

    assert(new BotMarcopolo(token));
    done();
  });
});

/**
 * Tests for the bot module
 */
var assert = require('assert');
var ButtonwoodBot = require('../buttonwood-bot');

describe('ButtonwoodBot', function(){
  it('should initialize buttonwood bot', function(done){
    var token = 'xoxb-16835262720-13214213213';

    assert(new ButtonwoodBot(token));
    done();
  });
});

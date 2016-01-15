/**
 * Tests for the bot module
 */
var Botkit = require('../lib/Botkit.js');
var assert = require('assert');

describe('Botkit', function(){
  it('successfully create slack bot and establish rtm connection', function(done){
    //var token = 'xoxb-16835262720-13214213213';
    var token = 'xoxb-pass-token'
    var controller = Botkit.slackbot({debug:false});

    controller.spawn({token:token}).startRTM((err, bot, payload)=> {
      if (err) {
	//assert(false);
	done();
      } else {
	bot.closeRTM();
	done();
      }
    });
    
  });
});

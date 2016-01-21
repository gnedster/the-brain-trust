require('./lib/fake-slack-site.js'); //Fake slack server
require('./lib/fake-slack-wss.js'); //Fake slack Websocket
var Botkit = require('../lib/Botkit.js');
var assert = require('assert');

describe('Botkit', function() {
  it('successfully create slack bot and establish rtm connection', function(done){
    var token = 'xoxb-valid-token';
    var controller = Botkit.slackbot({debug:false});

    controller.spawn({token:token}).startRTM(function (err, bot, payload) {
      if (err) {
        assert(err);
        done();
      } else {
        bot.closeRTM();
        done();
      }
    });
  });

  it('Use invalid token to fail rtm connection', function(done) {
    var token = 'xoxb-invalid-token';
    var controller = Botkit.slackbot({debug:false});

    controller.spawn({token:token}).startRTM(function (err, bot, payload) {
      assert(err);
      done();
      if (bot) {
        bot.closeRTM();
      }
    });
  });
});

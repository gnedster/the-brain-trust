var _ = require('lodash');
var Botkit = require('botkit');
var logger = require('@the-brain-trust/logger');
var moment = require('moment');
var util = require('@the-brain-trust/utility');

const rtmInterval = 5000;

/**
 * Generic wrapper for Botkit's Bot class
 * @class
 * @param {String} token Token for use against Slack's APIs
 */
function Bot(token) {
  if (token.startsWith('xoxb') === false) {
    logger.warn('invalid Slack token');
    return;
  }

  this.listeners = [];
  this.pingTimeout = null;
  this.timeToLiveTimeout = null;

  this.controller = Botkit.slackbot({
    debug: util.isProduction() ? false : true
  });

  this.bot = this.controller.spawn({token:token});
}

/**
 * Bot should start listening
 */
Bot.prototype.listen = function (){
  var self = this;
  this.startRtm();

  if (this.listeners.length === 0) {
    logger.warn('there are no listeners');
  }

  _.each(this.listeners.concat([this.hearsPong]), function(listener){
    listener.call(self, self.controller);
  });

  return this;
};

/**
 * Open up websocket
 */
Bot.prototype.startRtm = function() {
  var self = this;

  this.bot.startRTM(function(err, resp){
    if (err) {
      logger.error(err);
      if (err === 'invalid_auth') {
        return;
      }
      setTimeout(_.bind(self.startRtm, self), rtmInterval);
    } else {
      self.ping();
    }
  });
};

/**
 * Handle pong message
 */
Bot.prototype.hearsPong = function(controller) {
  var self = this;

  controller.hears(['ping'], 'pong', function(bot, message) {
    if (message.type === 'pong') {
      // Reset time to live
      clearTimeout(self.timeToLiveTimeout);
      clearTimeout(self.pingTimeout);
      self.pingTimeout = setTimeout(_.bind(self.ping, self), rtmInterval);
    }
  });
};
/**
 * Start ping/pong to determine connectivity, monitor latency,
 * and recover if possible.
 */
Bot.prototype.ping = function() {
  // If pong does not come back in rtmInterval, restart the rtm connection
  this.timeToLiveTimeout = setTimeout(_.bind(function(){
    this.bot.closeRTM();
    this.startRtm();
  }, this), rtmInterval);
  this.bot.say({
    type: 'ping',
    time: moment.now(),
    text: 'ping'
  });
};

module.exports = Bot;

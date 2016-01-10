var _ = require('lodash');
var Botkit = require('botkit');
var logger = require('@the-brain-trust/logger');
var moment = require('moment');
var util = require('@the-brain-trust/utility');

const rtmInterval = 5000;

/**
 * Generic wrapper for Botkit's Bot class
 * @class
 * @param {ApplicationPlatformEntity} applicationPlatformEntity
 */
function Bot(applicationPlatformEntity) {
  this.status = 'new';
  this.applicationPlatformEntity = applicationPlatformEntity;
  this.listeners = [];
  this.errors = [];
  this.pingTimeout = null;
  this.timeToLiveTimeout = null;

  // TODO: hardcoded for Slack
  var token = _.get(applicationPlatformEntity,
    'credentials.bot.bot_access_token');

  this.controller = Botkit.slackbot({
    debug: util.isProduction() ? false : true
  });

  this.bot = this.controller.spawn({token:token});
}

/**
 * Getter for Bot Id
 * @return {Integer} Id of the current bot
 */
Bot.prototype.getId = function() {
  return this.applicationPlatformEntity.id;
};

/**
 * Getter for Bot status
 * @return {String} Current status of the bot
 */
Bot.prototype.getStatus = function() {
  return this.status;
};

/**
 * Getter for Bot status
 * @return {String[]} Collection of errors for a given bot
 */
Bot.prototype.getErrors = function() {
  return this.errors;
};

/**
 * Bot should start listening
 */
Bot.prototype.start = function (){
  var self = this;
  this.status = 'starting';
  this.startRtm();

  if (this.listeners.length === 0) {
    logger.warn('no listeners configured');
  }

  // init listeners
  _.each(this.listeners.concat([this.hearsPong]), function(listener){
    listener.call(self, self.controller);
  });

  return this;
};

/**
 * @private
 * Open up Slack's real-time messaging api
 */
Bot.prototype.startRtm = function() {
  var self = this;

  this.bot.startRTM(function(err, resp){
    if (err) {
      self.status = 'error';
      self.errors.push(err);
      logger.error(err);
      if (err === 'invalid_auth' || err === 'not_authed') {
        return;
      }
      setTimeout(_.bind(self.startRtm, self), rtmInterval);
    } else {
      self.status = 'active';
      self.ping();
    }
  });
};

/**
 * @private
 * @param {Slackbot} controller  An instance of Slackbot
 * Handle pong message
 */
Bot.prototype.hearsPong = function(controller) {
  var self = this;

  controller.hears(['ping'], 'pong', function(bot, message) {
    if (message.type === 'pong') {
      // Reset time to live and ping timeout
      clearTimeout(self.timeToLiveTimeout);
      clearTimeout(self.pingTimeout);
      self.pingTimeout = setTimeout(_.bind(self.ping, self), rtmInterval);
    }
  });
};
/**
 * @private
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

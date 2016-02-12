var _ = require('lodash');
var Botkit = require('botkit');
var error = require('@the-brain-trust/error');
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
  this.lastStatusChangeAt = moment.now();
  this.applicationPlatformEntity = null;
  this.listeners = [];
  this.errors = [];
  this.pingTimeout = null;
  this.timeToLiveTimeout = null;
  this.controller = null;
  this.bot = null;

  this.updateBot(applicationPlatformEntity);
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
 * Set the status for the Bot, while setting the last status change
 * @param {String} status  Status to set
 */
Bot.prototype.setStatus = function(status) {
  this.status = status;
  this.lastStatusChangeAt = moment.now();
};

/**
 * Getter for Bot status
 * @return {String[]} Collection of errors for a given bot
 */
Bot.prototype.getErrors = function() {
  return this.errors;
};

/**
 * Get Bot status with timestamps of latest status Change
 * @return {String} Current status of the bot with timestamp
 */
Bot.prototype.getStatusString = function() {
  return `${this.status}:${moment(this.lastStatusChangeAt).fromNow()}`;
};

/**
 * Send a privateMessage to a given user
 * @param  {Object}         options                Options for the function
 * @param  {PlatformEntity} options.platformEntity PlatformEntity representing a user
 * @param  {Object}         options.message        Message to send to user
 */
Bot.prototype.sendPrivateMessage = function(options) {
  this.bot.startPrivateConversation(
    {
      user: options.platformEntity.entityId
    }, function(err,convo) {
      if (err) {
        error.notify('buttonwood', err);
        logger.error(err);
      } else {
        convo.say(options.message);
      }
    });
};

/**
 * Bot should start listening
 */
Bot.prototype.start = function (){
  var self = this;
  this.setStatus('starting');
  this.startRtm();

  if (this.listeners.length === 0) {
    logger.warn('no listeners configured');
  }

  // init listeners
  _.each(this.listeners.concat([
    this.hearsPong,
    this.hearsHelp,
    this.hearsHello]),
    function(listener){
      listener.call(self, self.controller);
    });

  return this;
};

/**
 * Update values to autorize bot
 * @param {ApplicationPlatformEntity} applicationPlatformEntity
 */
Bot.prototype.updateBot = function(applicationPlatformEntity) {
  this.applicationPlatformEntity = applicationPlatformEntity;
  // TODO: hardcoded for Slack
  var token = _.get(applicationPlatformEntity,
    'credentials.bot.bot_access_token');

  this.controller = Botkit.slackbot({
    debug: util.isProduction() ? false : true
  });

  this.bot = this.controller.spawn({token:token});
};

/**
 * @private
 * Open up Slack's real-time messaging api
 */
Bot.prototype.startRtm = function() {
  var self = this;

  this.bot.startRTM(function(err, resp){
    if (err) {
      self.setStatus('error');
      self.errors.push(err);
      logger.error(err);

      switch(err) {
        case 'invalid_auth':
        case 'not_authed':
        case 'account_inactive':
          return;
        default:
          setTimeout(_.bind(self.startRtm, self), rtmInterval);
      }
    } else {
      if (self.listeners.length === 0) {
        self.setStatus('partial'); // No extra listeners configured, a dumb bot.
      } else {
        self.setStatus('active');
      }
      self.ping();
    }
  });
};

/**
 * @private
 * @param {Slackbot} controller  An instance of Slackbot
 * Handle hello message
 */
Bot.prototype.hearsHello = function(controller) {
  controller.hears(['hi, hello'], 'direct_message', function(bot, message) {
    bot.reply(message, 'Hi there! Type *help* to see what I can do.');
  });
};

/**
 * @private
 * @param {Slackbot} controller  An instance of Slackbot
 * Handle help message
 */
Bot.prototype.hearsHelp = function(controller) {
  controller.hears(['help', 'halp'], 'direct_message', function(bot, message) {
    bot.reply(message, 'Oops! Looks like there\'s no help text.');
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

var _ = require('lodash');
var Botkit = require('botkit');
var logger = require('@the-brain-trust/logger');
var moment = require('moment');
var rds = require('@the-brain-trust/rds');
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

  this.populateUsers();
}

/**
 * Populate users for a given team.
 */
Bot.prototype.populateUsers = function() {
  var self = this;

  self.bot.api.users.list({}, function(err,response) {
    rds.models.Platform.findOne({
        where: {
          name: 'slack'
        }
      }).then(function(platform) {
        _.each(response.members, function(member) {
          rds.models.PlatformEntity.findOrCreate({
            where: {
              entityId: member.id,
              platform_id: platform.id,
              kind: 'user'
            }
          }).then(function(tuple) {
            var user = tuple[0];
            user.update({
              parent_id: self.applicationPlatformEntity.platform_entity_id
            });
          });
        });
      });
  });

};

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
  return `${this.status}:${moment(this.lastStatusChangeAt).fromNow()}`;
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

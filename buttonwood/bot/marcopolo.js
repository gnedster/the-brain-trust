const bot = require('@the-brain-trust/bot');
const marcopolo = require('../app/marcopolo');
const error = require('@the-brain-trust/error');
const logger = require('@the-brain-trust/logger');
const metric = require('@the-brain-trust/metric');
const moment = require('moment');

const errorMessage = 'Looks like marcopolo ran into an error, we\'ve been notified and we\'ll try to fix it promptly. Thanks for your patience.';

/**
 * Return usage information.
 * @param  {CoreController}
 */
function hearsHello(controller) {
  const introduction = ['I\'m marcopolo, it\'s nice to meet you!',
    'Type out a sentence like *I\'d like to buy an iPhone 7* and I\'ll get some results for you.',
    'For more information, directly message me with *help*.'
    ].join(' ');

  controller.hears(['hello', 'hi'],
    'hello,direct_message,direct_mention,mention',
    function(bot,message) {
      bot.reply(message, introduction);
    });
}

/**
 * Return Amazon search results when a user intends to buy
 * @param  {CoreController}
 */
function hearsSearchFor(controller) {
  const searchFor = 'search for';
  controller.hears([`^${searchFor}`],
    'direct_message,direct_mention,mention',function(bot,message) {

    metric.write({
      teamId: bot.team_info.id,
      channelId: message.channel,
      userId: message.user,
      initiator: 'client x user',
      timestamp: moment.unix(message.ts),
      name: 'chat:marcopolo:slack:​*:*​:message',
      details: {
        text: message.text
      }
    });

    marcopolo.messageAmazonResults(message.text.replace(searchFor, ''))
      .then(function(response) {
      return new Promise(function(resolve, reject) {
        bot.reply(message, response, function(err, resp) {
          if (err) {
            reject(err);
          }

          metric.write({
            teamId: bot.team_info.id,
            channelId: message.channel,
            userId: message.user,
            initiator: 'server x app',
            timestamp: moment.unix(resp.ts),
            name: 'chat:marcopolo:slack:​*:*​:reply',
            details: {
              product: message.text
            }
          });

          resolve();
        });
      });
    }).catch(function(err){
      bot.reply(message, errorMessage);
      error.notify('marcopolo', err); // Should be higher up the stack
      logger.error(err);
    });

  });
}

/**
 * Return Amazon search results when a user intends to buy
 * @param  {CoreController}
 */
function hearsAmazonLink(controller) {
  controller.hears([marcopolo.getAmazonLinkFormat()],
    'direct_message,direct_mention,mention',function(bot,message) {

    metric.write({
      teamId: bot.team_info.id,
      channelId: message.channel,
      userId: message.user,
      initiator: 'client x user',
      timestamp: moment.unix(message.ts),
      name: 'chat:marcopolo:slack:​*:*​:message',
      details: {
        text: message.text
      }
    });

    marcopolo.messageAmazonLookup(message.text)
      .then(function(response) {
      return new Promise(function(resolve, reject) {
        bot.reply(message, response, function(err, resp) {
          if (err) {
            reject(err);
          }

          metric.write({
            teamId: bot.team_info.id,
            channelId: message.channel,
            userId: message.user,
            initiator: 'server x app',
            timestamp: moment.unix(resp.ts),
            name: 'chat:marcopolo:slack:​*:*​:reply',
            details: {
              text: message.text
            }
          });

          resolve();
        });
      });
    }).catch(function(err){
      bot.reply(message, errorMessage);
      error.notify('marcopolo', err); // Should be higher up the stack
      logger.error(err);
    });
  });
}

/**
 * @private
 * @override
 * @param {Slackbot} controller  An instance of Slackbot
 * Handle help message
 */
function hearsHelp(controller) {
  controller.hears(['help', 'halp'], 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message, [
      '*When directly mentioning marcopolo:*',
      '_search for <product name>_: provides the top 3 Amazon search results',
      '_help_: shows this message'
    ].join('\n'));
  });
}

/**
 * @class
 * Defines the behavior for the marcopolo bot
 * @param {ApplicationPlatformEntity} applicationPlatformEntity  Slack token
 */
function BotMarcopolo(applicationPlatformEntity) {
  bot.Bot.call(this, applicationPlatformEntity);
  this.listeners = [hearsSearchFor, hearsAmazonLink];
}

BotMarcopolo.prototype = Object.create(bot.Bot.prototype);
BotMarcopolo.prototype.constructor = bot.Bot;
BotMarcopolo.prototype.hearsHelp = hearsHelp;
BotMarcopolo.prototype.hearsHello = hearsHello;

module.exports = BotMarcopolo;

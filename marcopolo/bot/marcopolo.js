var _ = require('lodash');
var Bot = require('../lib/bot');
var marcopolo = require('../app/marcopolo');
var error = require('@the-brain-trust/error');
var logger = require('@the-brain-trust/logger');
var metric = require('@the-brain-trust/metric');
var moment = require('moment');

const errorMessage = 'something went horribly wrong.';

/**
 * Return usage information.
 * @param  {CoreController}
 */
function hearsHello(controller) {
  var introduction = ['I\'m marcopolo, it\'s nice to meet you!',
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
function hearsBuy(controller) {
  controller.hears([marcopolo.getPurchaseIntentRegex()],
    'direct_message,direct_mention,mention,ambient',function(bot,message) {
    var products = marcopolo.parseProducts(message.text);

    if (_.isEmpty(products)) {
      return;
    }

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

    marcopolo.messageAmazonResults(products)
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
              products: products
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
      '*Commands available in any channel marcopolo is present:*',
      '_buy <product name>_: provide Amazon search results',
      '',
      '*When directly mentioning marcopolo (all of the above and):*',
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
  Bot.call(this, applicationPlatformEntity);
  this.listeners = [hearsBuy];
}

BotMarcopolo.prototype = Object.create(Bot.prototype);
BotMarcopolo.prototype.constructor = Bot;
BotMarcopolo.prototype.hearsHelp = hearsHelp;
BotMarcopolo.prototype.hearsHello = hearsHello;

module.exports = BotMarcopolo;

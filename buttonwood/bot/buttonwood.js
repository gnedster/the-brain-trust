var _ = require('lodash');
var Bot = require('../lib/bot');
var buttonwood = require('../app/buttonwood');
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
  var introduction = ['I\'m buttonwood, it\'s nice to meet you!',
    'Type out a stock quote like *$AAPL* and I\'ll get a quote for you.',
    'For more information, directly message me with *help*.'
    ].join(' ');

  controller.hears(['hello', 'hi'],
    'hello,direct_message,direct_mention,mention',
    function(bot,message) {
      bot.reply(message, introduction);
    });
}

/**
 * Return stock information when a ticker symbol is provided.
 * @param  {CoreController}
 */
function hearsSymbol(controller) {
  controller.hears([buttonwood.getStockListenRegex()],
    'direct_message,direct_mention,mention,ambient',function(bot,message) {
    var matches = buttonwood.parseStockQuote(message.text);
    var isDetailed = /detail/ig.test(message.text);
    var symbols = _.compact(_.map(matches, function(symbol) {
      return symbol.substring(1).toUpperCase();
    }));

    if (_.isEmpty(symbols)) {
      return;
    }

    metric.write({
      teamId: bot.team_info.id,
      channelId: message.channel,
      userId: message.user,
      initiator: 'client x user',
      timestamp: moment.unix(message.ts),
      name: 'chat:buttonwood:slack:​*:*​:message',
      details: {
        text: message.text
      }
    });

    buttonwood.messageQuote({valid: symbols}, isDetailed)
      .then(function(response) {
        return new Promise(function(resolve, reject) {
          bot.reply(message, response, function(err, resp) {
            if (err) {
              reject(err);
            }

            metric.write({
              teamId: bot.team_info.id,
              channelId: resp.channel,
              userId: message.user,
              initiator: 'server x app',
              timestamp: moment.unix(resp.ts),
              name: 'chat:buttonwood:slack:​*:*​:reply',
              details: {
                symbols: symbols
              }
            });

            resolve();
          });
        });
      }).catch(function(err){
        bot.reply(message, errorMessage);
        error.notify('buttonwood', err); // Should be higher up the stack
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
      '*In any channel buttonwood is present:*',
      '_$<ticker>_: get stock quotes',
      '_$<ticker> detail_: get detailed stock quotes',
      '*When directly mentioning buttonwood:*',
      '_help_: shows this message',
      '*When direct messaging buttonwood:*',
      '_start summaries_: send portfolio summaries at 4:20 PM ET every weekday',
      '_stop summaries_: stop sending daily portfolio summaries'
    ].join('\n'));
  });
}

/**
 * Stop delivering portfolio summaries
 * @param  {CoreController} controller
 */
function hearsStop(controller) {
  controller.hears(['stop summaries'], 'direct_message', function(bot, message) {
    buttonwood.setPortfolioSummary({
      entityId: message.user,
      summary: null
    }).then(function(tuple) {
      bot.reply(message, 'Ok, I\'ll stop sending you daily portfolio summaries. ' +
        'If you change your mind, you can just tell me to *start summaries*.');
    }).catch(function(){
      bot.reply(message, errorMessage);
    });
  });
}

/**
 * Start delivering portfolio summaries
 * @param  {CoreController} controller
 */
function hearsStart(controller) {
  controller.hears(['start summaries'], 'direct_message', function(bot,message) {
    buttonwood.setPortfolioSummary({
      entityId: message.user,
      summary: 'daily' // Only daily summaries are supported
    }).then(function(tuple) {
      bot.reply(message, 'Ok, I\'ll send you daily portfolio summaries every weekday at 4:20 PM ET. ' +
        'If you change your mind, you can just tell me to *stop summaries*.');
    }).catch(function(){
      bot.reply(message, errorMessage);
    });
  });
}

/**
 * @class
 * Defines the behavior for the buttonwood bot
 * @param {ApplicationPlatformEntity} applicationPlatformEntity  Slack token
 */
function BotButtonwood(applicationPlatformEntity) {
  Bot.call(this, applicationPlatformEntity);
  this.listeners = [hearsStop, hearsStart, hearsSymbol];
}

BotButtonwood.prototype = Object.create(Bot.prototype);
BotButtonwood.prototype.constructor = Bot;
BotButtonwood.prototype.hearsHelp = hearsHelp;
BotButtonwood.prototype.hearsHello = hearsHello;

module.exports = BotButtonwood;

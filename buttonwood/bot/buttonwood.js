var _ = require('lodash');
var Bot = require('../lib/bot');
var buttonwood = require('../app/buttonwood');
var logger = require('@the-brain-trust/logger');
var metric = require('@the-brain-trust/metric');

/**
 * Return usage information.
 * @param  {CoreController}
 */
function hearsHello(controller) {
  var introduction = 'I\'m buttonwood, it\'s nice to meet you!' +
    'Type out a stock symbol like *$AAPL*, and I\'ll get a price quote for you.';

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
  controller.hears(['(\$[A-z]*)'],
    'direct_message,direct_mention,mention,ambient',function(bot,message) {
    var matches = message.text.match(/\$([A-z]*)/ig);
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
      timestamp: message.ts,
      name: 'chat:buttonwood:slack:​*:*​:message',
      details: {
        text: message.text
      }
    });


    buttonwood.messageQuote(symbols, isDetailed)
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
              timestamp: resp.ts,
              name: 'chat:buttonwood:slack:​*:*​:reply',
              details: {
                symbols: symbols
              }
            });
          });
        });
      }).catch(function(err){
        bot.reply(message, 'something went horribly wrong');
        logger.error(err);
      });
  });
}

/**
 * @class
 * Defines the behavior for the buttonwood bot
 * @param {String} token  Slack token
 */
function ButtonwoodBot(token) {
  Bot.call(this, token);

  this.listeners = [hearsHello, hearsSymbol];
}

ButtonwoodBot.prototype = Object.create(Bot.prototype);
ButtonwoodBot.prototype.constructor = Bot;

module.exports = ButtonwoodBot;
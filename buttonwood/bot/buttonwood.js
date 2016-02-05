var _ = require('lodash');
var Bot = require('../lib/bot');
var buttonwood = require('../app/buttonwood');
var CronJob = require('cron').CronJob;
var error = require('@the-brain-trust/error');
var logger = require('@the-brain-trust/logger');
var metric = require('@the-brain-trust/metric');
var moment = require('moment');
var rds = require('@the-brain-trust/rds');

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
  controller.hears(['',buttonwood.getStockListenRegex()],
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
        bot.reply(message, 'something went horribly wrong');
        error.notify('buttonwood', err); // Should be higher up the stack
        logger.error(err);
      });
  });
}

/**
 * Push portfolio summaries to users
 */
function pushSummaries() {
  var self = this;

  rds.models.Portfolio.findAll({
    where: {
      summary: {
        $ne: null
      }
    },
    include: [{
      model: rds.models.PlatformEntity,
      required: true
    }]
  }).then(function(portfolios) {
    _.each(portfolios, function(portfolio) {
      self.bot.startPrivateConversation(
        {
          user: portfolio.PlatformEntity.entityId
        }, function(err,convo) {
          if (err) {
            logger.error(err);
          } else {
            buttonwood
              .messageQuote({valid: portfolio.symbols}, false)
              .then(function(message) {
                convo.say(_.merge({
                  text: `*Your summary for ${moment().format('LL')}*`
                }, message));

              });
          }
        });
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
  this.listeners = [hearsHello, hearsSymbol];

  // Push summaries at 4:20 PM ET every weekday. Possible to clear out
  new CronJob('00 4 16 * * 1-5',
    _.bind(pushSummaries, this),
    null,
    true,
    'America/New_York');
}

BotButtonwood.prototype = Object.create(Bot.prototype);
BotButtonwood.prototype.constructor = Bot;
BotButtonwood.prototype.pushSummaries = pushSummaries;

module.exports = BotButtonwood;

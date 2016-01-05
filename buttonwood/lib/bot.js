var _ = require('lodash');
var Botkit = require('botkit');
var logger = require('@the-brain-trust/logger');
var moment = require('moment');
var number = require('./number');
var util = require('@the-brain-trust/utility');
var yahooFinance = require('yahoo-finance');

/*
 * Global bot responses, TODO move buttonwood specific details to bot module
 */
var priceTpl = _.template(
  ['*<%= symbol %>* (<%= name %>) last traded at *$<%= lastTradePriceOnly %>*.',
   'https://finance.yahoo.com/q?s=<%= symbol %>'
  ].join('\n')
);
var notFoundTpl =
  _.template('*<%= symbol %>* doesn\'t look like a valid symbol.');
var introduction = ['I\'m buttonwood, it\'s nice to meet you!',
    'Type out a stock symbol like *$AAPL*, and I\'ll get the latest price ' +
    'for you.'].join('\n');

// ------ Utility functions ------

/**
 * Return usage information.
 * @param  {CoreController}
 */
function listenForUsageInfo(controller) {
  controller.hears(['hello', 'hi'],'direct_message,direct_mention,mention',
      function(bot,message) {
    controller.storage.users.get(message.user,function(err,user) {
      if (user && user.name) {
        bot.reply(message, 'Hello ' + user.name + '!' + introduction);
      } else {
        bot.reply(message, introduction);
      }
    });
  });
}

/**
 * Return stock information when a ticker symbol is provided.
 * @param  {CoreController}
 */
function listenForStockInfo(controller) {
  controller.hears(['(\$[A-z]*)'],
      'direct_message,direct_mention,mention,ambient',function(bot,message) {
    var matches = message.text.match(/\$([A-z]*)/ig);
    var symbols = _.compact(_.map(matches, function(symbol) {
      return symbol.substring(1).toUpperCase();
    }));

    if (_.isEmpty(symbols)) {
      return;
    }

    yahooFinance.snapshot({
      symbols: symbols,
      /**
       * s = symbol
       * n = name
       * l1 = lastTradePriceOnly
       * p2 = changeInPercent
       * d1 = lastTradeDate
       * t1 = lastTradeTime
       */
      fields: ['s', 'n', 'l1', 'p2', 'd1', 't1']
    }, function (err, snapshot) {
      if (err) {
        bot.reply(message,'Sorry, something went terribly wrong.');
      } else {
        var attachments = _.map(snapshot, function(data) {
          logger.debug(data);
          if (_.isEmpty(data.name)) {
            return {
              fallback: notFoundTpl(data),
              text: notFoundTpl(data),
              mrkdwn_in : ['text']
            };
          } else {
            return {
              fallback: priceTpl(data),
              color: number.color(data.changeInPercent),
              title: _.template('<%= symbol %> (<%= name %>)')(data),
              title_link: `https://finance.yahoo.com/q?s=${data.symbol}`,
              text: _.template([
                '<%=lastTradeDate%> <%=lastTradeTime%> ET',
                '*<%= lastTrade %>* (<%= sign %><%= percent %>)'
                ].join('\n')
                )({
                lastTradeDate: moment(data.lastTradeDate).format('LL'),
                lastTradeTime: data.lastTradeTime,
                lastTrade: number.toCurrency(data.lastTradePriceOnly),
                sign: number.sign(data.changeInPercent),
                percent: number.toPercent(Math.abs(data.changeInPercent))
              }),
              mrkdwn_in : ['title', 'text']
            };
          }
        });

        bot.reply(message, {attachments: attachments}, function(err, resp) {
          logger.debug(err, resp);

          if (err) {
            bot.reply(message, {
              attachments: [{
                fallback: 'something went horribly wrong',
                pretext: 'something went horribly wrong'
              }]
            });
          }
        });
      }
    });
  });
}

/**
 * Buttonwood Bot class
 * @class
 * @param {String} inToken Token for use against Slack's APIs
 */
function Bot(inToken) {
  if (inToken.startsWith('xoxb') === false) {
    logger.warn('invalid Slack token');
    return;
  }

  this.controller = Botkit.slackbot({
    debug: util.isProduction() ? false : true
  });

  this.bot = this.controller.spawn({token:inToken});
}

Bot.prototype.listen = function(){
  this.bot.startRTM();

  listenForUsageInfo(this.controller);
  listenForStockInfo(this.controller);

  return this;
};

module.exports = Bot;

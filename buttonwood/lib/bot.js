var Botkit = require('botkit');
var yahooFinance = require('yahoo-finance');
var _ = require('lodash');
var util = require('@the-brain-trust/utility');
var logger = require('@the-brain-trust/logger');

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
      fields: ['s', 'n', 'l1']
    }, function (err, snapshot) {
      if (err) {
        logger.error(err);
        bot.reply(message,'Sorry, something went terribly wrong.');
      } else {
        var messages = _.map(snapshot, function(data) {
          if (_.isEmpty(data.name)) {
            return notFoundTpl(data);
          } else {
            return priceTpl(data);
          }
        });

        bot.reply(message, messages.join('\n'));
      }
    });
  });
}

/**
 * Instance of a bot
 * @class
 * @param {String} Bot token
 */
function Bot(inToken) {
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

var Botkit = require('./node_modules/botkit/lib/Botkit.js');
var yahooFinance = require('yahoo-finance');
var _ = require('lodash');

module.exports = Bot;

/*
 * Global bot responses
 */
var priceTpl = _.template(
  ['*<%= symbol %>* (<%= name %>) last traded at *$<%= lastTradePriceOnly %>*.',
   'https://finance.yahoo.com/q?s=<%= symbol %>'
  ].join('\n')
);
var notFoundTpl = _.template('*<%= symbol %>* doesn\'t look like a valid symbol.');
var introduction = ["I'm buttonwood, it's nice to meet you!",
    "Type out a stock symbol like *$AAPL*, and I'll get the latest price for you."].join("\n");

/*
 * Utility functions
 */
function listenForUsageInfo(controller) {
  /**
   * Return usage information.
   * @param  {Corebot} bot
   * @param  {String} message
   */
  controller.hears(['hello', 'hi'],'direct_message,direct_mention,mention',function(bot,message) {
    controller.storage.users.get(message.user,function(err,user) {
      if (user && user.name) {
        bot.reply(message, "Hello " + user.name + "!" + introduction);
      } else {
        bot.reply(message, introduction);
      }
    });
  });
}

function listenForStockInfo(controller) {
  /**
   * Return stock information when a ticker symbol is provided.
   * @param  {Corebot} bot
   * @param  {String} message
   */
  controller.hears(['(\$[A-z]*)'],'direct_message,direct_mention,mention,ambient',function(bot,message) {
    var matches = message.text.match(/\$([A-z]*)/ig);
    var symbols = _.compact(_.map(matches, function(symbol) {
      return symbol.substring(1).toUpperCase();
    }));

    if (_.isEmpty(symbols)) {
      return;
    }

    yahooFinance.snapshot({
      symbols: symbols,
      fields: ['s', 'n', 'l1'],
    }, function (err, snapshot) {
      if (err) {
        console.log(err);
        bot.reply(message,"Sorry, something went terribly wrong.");
      } else {
        var messages = _.map(snapshot, function(data) {
          if (_.isEmpty(data.name)) {
            return notFoundTpl(data);
          } else {
            return priceTpl(data);
          }
        });

        bot.reply(message, messages.join("\n"));
      }
    });
  });
}

/*
 * Bot object, for now it is just the Constructor
 */
function Bot(_token) {
  this.controller = Botkit.slackbot({
    debug: false
  });

  this.bot = this.controller.spawn(
    {
      token:_token
    }
  ).startRTM();

  listenForUsageInfo(this.controller);
  listenForStockInfo(this.controller);
}

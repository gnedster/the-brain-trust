var Botkit = require('./node_modules/botkit/lib/Botkit.js');
var yahooFinance = require('yahoo-finance');
var _ = require('lodash');

var controller = Botkit.slackbot({
  debug: false
});

var bot = controller.spawn(
  {
    token:process.env.token
  }
).startRTM();

var priceTpl = _.template('*<%= symbol %>* (<%= name %>) last traded at *$<%= lastTradePriceOnly %>*.');
var notFoundTpl = _.template('*<%= symbol %>* doesn\'t look like a valid symbol.');

/**
 * Return usage information.
 * @param  {Corebot} bot
 * @param  {String} message
 */
controller.hears(['hello', 'hi'],'direct_message,direct_mention,mention',function(bot,message) {
  var introduction =
      "I am buttonwood, it's nice to meet you! " +
      "Send me a stock ticker symbol like *$AAPL*, and I'll get that information for you. " +
      "You can also get more than one symbol at a time.";

  controller.storage.users.get(message.user,function(err,user) {
    if (user && user.name) {
      bot.reply(message, "Hello " + user.name + "!" + introduction);
    } else {
      bot.reply(message, introduction);
    }
  });
});

/**
 * Return stock information when a ticker symbol is provided.
 * @param  {Corebot} bot
 * @param  {String} message
 */
controller.hears(['(\$[A-z]*)'],'direct_message,direct_mention,mention',function(bot,message) {
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

var _ = require('lodash');
var accounting = require('accounting');
var Botkit = require('botkit');
var logger = require('@the-brain-trust/logger');
var metric = require('@the-brain-trust/metric');
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

    /**
     * https://greenido.wordpress.com/2009/12/22/yahoo-finance-hidden-api/
     * s = symbol
     * n = name
     * l1 = lastTradePriceOnly
     * c1 = change
     * p2 = changeInPercent
     * d1 = lastTradeDate
     * t1 = lastTradeTime
     * v = volume
     * r = peRatio
     * w = 52WeekRange
     * e = earningsPerShare
     * m = daysRange
     * j1 = marketCap
     */
    var fieldsBasic = ['s', 'n', 'l1', 'c1', 'p2', 'd1', 't1'];
    var fieldsDetailed = ['v', 'r', 'w', 'e', 'm', 'j1'];

    yahooFinance.snapshot({
      symbols: symbols,
      fields: isDetailed ? fieldsBasic.concat(fieldsDetailed) : fieldsBasic
    }).then(function (snapshots) {
      var attachments = _.map(snapshots, function(data) {
        logger.debug(data);

        var attachmentFieldsBasic = [{
          title: 'Last Trade',
          value: `${accounting.formatMoney(data.lastTradePriceOnly)}`,
          short: true
        }, {
          title: 'Change',
          value: `${number.sign(data.change)}${Math.abs(data.change)} (${number.sign(data.changeInPercent)}${number.toPercent(Math.abs(data.changeInPercent))})`,
          short: true
        }];

        var attachmentFieldsDetailed = [{
          title: 'Volume',
          value: accounting.formatNumber(data.volume),
          short: true
        }, {
          title: 'Day Range',
          value: data.daysRange || 'n/a',
          short: true
        }, {
          title: '52 Week Range',
          value: data['52WeekRange'] || 'n/a',
          short: true
        }, {
          title: 'P/E',
          value: data.peRatio || 'n/a',
          short: true
        }, {
          title: 'EPS',
          value: data.earningsPerShare ? accounting.formatMoney(data.earningsPerShare) : 'n/a',
          short: true
        }, {
          title: 'Market Capitalization',
          value: data.marketCapitalization || 'n/a',
          short: true
        }];

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
            text: `*${moment(data.lastTradeDate).format('LL')} ${data.lastTradeTime} ET*`,
            fields:  isDetailed ? attachmentFieldsBasic.concat(attachmentFieldsDetailed) : attachmentFieldsBasic,
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
    }).catch(function(err){
      logger.error(err);
    });
  });
}

function listenForPongResponse(bot, controller) {
  controller.on('message_received', function(inBot, msg){
    var msgType = _.get(msg,'type');
    var replyTo = parseInt(_.get(msg,'reply_to'));
    if (msgType === 'pong') {
      logger.info('TMsg Pong ' + replyTo);
      bot.pongResponseID = replyTo;
    }
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
  this.pongResponseID = 0;
}

function startBot(ourBot){
  var bot = ourBot;
  bot.startRTM(function(err, inBot, payload) {
    if (_.isNull(err)) {
      bot.initRTMPulse(ourBot);
    } else {
      //Wait 5 secs before trying to restart bot
      setTimeout(function(){startBot(ourBot)}, 5000);
    }
  });
}

Bot.prototype.initRTMPulse = function(ourBot){
  var bot = ourBot.bot
  var pingID = bot.msgcount;
  return new Promise(function(resolve, reject) {
    bot.say(
    {
      type:'ping'
    },function(err){
      //console.log('New Msg ' + err);
      if (!_.isNull(err)) {
        reject(err);
      }
      setTimeout(function(){
        if(ourBot.pongResponseID >= pingID) {
          resolve();
        } else {
          reject(new Error('No pong response in 5 seconds'+ourBot.pongResponseID+' '+pingID));
        }
      }, 5000);
    })
  })
  .then(function(resp){
    logger.info('Bot has heartbeat');
    /* Sleep for 5 seconds */
    setTimeout(function() {return new Promise(function (resolve, reject){
      ourBot.initRTMPulse(ourBot);
      resolve();
    })}, 5000);
  })
  .catch(function(err){
    //Restart connection
    logger.info('Bot is Dead restart ' + err);
    bot.closeRTM();
    startBot(ourBot);
  });
}

Bot.prototype.startRTM = function(cb) {
    logger.info('TMsg start RTM');
  this.bot.startRTM(function(err, inBot, payload) {
    logger.info('TMsg start RTM Done', err);
    cb(err);
  });
};

Bot.prototype.listen = function(){

  listenForUsageInfo(this.controller);
  listenForStockInfo(this.controller);
  listenForPongResponse(this, this.controller);

  return this;
};

module.exports = Bot;

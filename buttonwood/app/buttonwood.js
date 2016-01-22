/**
 * Contains the business logic for constructing responses
 */
var _ = require('lodash');
var accounting = require('accounting');
var logger = require('@the-brain-trust/logger');
var moment = require('moment');
var number = require('../lib/number');
var util = require('@the-brain-trust/utility');
var googleStocks = require('google-stocks');
var yahooFinance = require('yahoo-finance');

/**
 * Return formatted message
 * @param  {String[]} symbols     Symbols to get price quotes for
 * @param  {String[]} isDetailed  Provide more information than necessary
 * @return {Promise}              Promise containing Slack messages for symbols
 */
function messageQuote(symbols, isDetailed) {
  /**
   * Get realtime Google Quotes
   * @param  {String[]} symbols  Array of stock symbols
   * @return {Promise}           A promise full of Google Quotes
   */
  function getGoogleQuotes(symbols) {
    var priceTpl = _.template('<%= t %> last traded at $<%= l_cur %>.');
    var notFoundTpl =_.template('<%= symbol %> doesn\'t look like a valid symbol.');

    return new Promise(function(resolve, reject){
      googleStocks.get(symbols, function(err, snapshots) {
        var attachments, dataBySymbol;

        if (err) {
          if (err.includes(400)) {
            snapshots = [];
          } else {
            reject(err);
          }
        }
        dataBySymbol = _.indexBy(snapshots, function(snapshot) {
          return snapshot.t;
        });
        attachments = _.map(symbols, function(symbol) {
          var data = dataBySymbol[symbol];
          var fields;

          if (data) {
            fields = [{
              title: 'Last Trade',
              value: `${accounting.formatMoney(data.l_cur)}`,
              short: true
            }, {
              title: 'Change',
              value: `${data.c} (${data.cp}%)`,
              short: true
            }];
            return {
              fallback: priceTpl(data),
              color: number.color(data.c_fix),
              title: data.t,
              title_link: util.getRedirectUri(`https://www.google.com/finance?q=${data.t}`),
              text: `*${data.lt}*`,
              fields: fields,
              mrkdwn_in : ['title', 'text']
            };
          } else {
            return {
              fallback: notFoundTpl({symbol}),
              text: notFoundTpl({symbol}),
              mrkdwn_in : ['text']
            };
          }
        });
        resolve({attachments: attachments});
      });
    });
  }

  /**
   * Get delayed but detailed Yahoo Quotes
   * @param  {String[]} symbols Array of stock symbols
   * @return {Promise}          Promise containing additional fields
   */
  function getYahooQuotes(symbols) {
    /**
     * https://greenido.wordpress.com/2009/12/22/yahoo-finance-hidden-api/
     * s = symbol
     * n = name
     * l1 = lastTradePriceOnly
     * c1 = change
     * p2 = changeInPercent
     * d1 = lastTradeDate
     * t1 = lastTradeTime
     * a2 = avgDailyVolume
     * v = volume
     * r = peRatio
     * w = 52WeekRange
     * e = earningsPerShare
     * m = daysRange
     * j1 = marketCap
     */
    var priceTpl = _.template(
      '<%= symbol %> (<%= name %>) last traded at $<%= lastTradePriceOnly %>.'
      );
    var notFoundTpl =_.template(
      '<%= symbol %> doesn\'t look like a valid symbol.'
      );

    return yahooFinance.snapshot({
      symbols: symbols,
      fields: ['s', 'n', 'l1', 'c1', 'p2', 'd1', 't1', 'v', 'a2', 'r', 'w', 'e', 'm', 'j1']
    }).then(function (snapshots) {
      var attachments = _.map(snapshots, function(data) {
        logger.debug(data);

        var fields = [{
          title: 'Last Trade',
          value: `${accounting.formatMoney(data.lastTradePriceOnly)}`,
          short: true
        }, {
          title: 'Change',
          value: `${number.sign(data.change)}${Math.abs(data.change)} (${number.sign(data.changeInPercent)}${number.toPercent(Math.abs(data.changeInPercent))})`,
          short: true
        }, {
          title: 'Volume',
          value: accounting.formatNumber(data.volume),
          short: true
        }, {
          title: 'Avg. Daily Volume',
          value: accounting.formatNumber(data.averageDailyVolume),
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
            title_link: util.getRedirectUri(`https://finance.yahoo.com/q?s=${data.symbol}`),
            text: `*${moment(data.lastTradeDate).format('LL')} ${data.lastTradeTime} ET* (Delayed)`,
            fields: fields,
            mrkdwn_in : ['title', 'text']
          };
        }
      });

      return {
        attachments: attachments
      };
    });
  }

  if (isDetailed === true) {
    return getYahooQuotes(symbols);
  } else {
    return getGoogleQuotes(symbols);
  }
}

module.exports = {
  messageQuote: messageQuote
};

/**
 * Contains the business logic for constructing responses
 */
var _ = require('lodash');
var accounting = require('accounting');
var logger = require('@the-brain-trust/logger');
var moment = require('moment');
var number = require('../lib/number');
var yahooFinance = require('yahoo-finance');

/**
 * Return formatted message
 * @param  {String[]} symbols     Symbols to get price quotes for
 * @param  {String[]} isDetailed  Provide more information than necessary
 * @return {Promise}              Promise containing Slack messages for symbols
 */
function messageQuote(symbols, isDetailed) {
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
  var fieldsBasic = ['s', 'n', 'l1', 'c1', 'p2', 'd1', 't1'];
  var fieldsDetailed = ['v', 'a2', 'r', 'w', 'e', 'm', 'j1'];

  var priceTpl = _.template(
    '<%= symbol %> (<%= name %>) last traded at $<%= lastTradePriceOnly %>.'
    );
  var notFoundTpl =_.template(
    '<%= symbol %> doesn\'t look like a valid symbol.'
    );

  return yahooFinance.snapshot({
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
            title_link: `https://finance.yahoo.com/q?s=${data.symbol}`,
            text: `*${moment(data.lastTradeDate).format('LL')} ${data.lastTradeTime} ET*`,
            fields: isDetailed ? attachmentFieldsBasic.concat(attachmentFieldsDetailed) : attachmentFieldsBasic,
            mrkdwn_in : ['title', 'text']
          };
        }
      });

      return {
        attachments: attachments
      };
    });
}

module.exports = {
  messageQuote: messageQuote
};

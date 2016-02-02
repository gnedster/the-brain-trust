/**
 * Contains the business logic for constructing responses
 */
var _ = require('lodash');
var accounting = require('accounting');
var logger = require('@the-brain-trust/logger');
var moment = require('moment');
var number = require('../lib/number');
var rds = require('@the-brain-trust/rds');
var util = require('@the-brain-trust/utility');
var yahooFinance = require('yahoo-finance');

var stockRegexString = '(?=[\\.\\d\\^:@]*[a-z])([a-z\\.\\d\\^:@]+)';
var stockRegex = new RegExp('\\$' + stockRegexString,'gi');

/**
 * Find the best match for symbols given some text. Each term is first
 * checked against the tickers in db, then the remaining terms are assumed to
 * be some ticker name.
 * @param  {String}     text  String to parse
 * @return {Promise}          Promise resolves object containing valid and
 *                            invalid symbols
 */
function matchSymbols(text) {
  var searchTerms = [];
  var tokens = _.compact(_.uniq(_.map(text.split(' '), function(term) {
    return term.toUpperCase();
  })));

  var result = Object.create({
    valid: [],
    invalid: []
  });

  if (text.length === 0) {
    return Promise.resolve(result);
  }

  return rds.models.Symbol.findAll({
    attributes: ['ticker'],
    where: {
      ticker: {
        $in: tokens
      }
    }
  }).then(function(symbols) {
    if (symbols.length > 0) {
      _.each(tokens, function(token, idx) {
        if (_.find(symbols, 'ticker', token)) {
          result.valid.push(token);
          tokens[idx] = null;
        }
      });
    }

    var searchTerm = null;

    for (var i = 0, ii = tokens.length + 1; i < ii; i++) {
      if (_.isString(tokens[i])) {
        searchTerm = searchTerm || '';
        searchTerm += ` ${tokens[i]}`;
      } else {
        if (searchTerm) {
          searchTerms.push(_.trim(searchTerm));
          searchTerm = null;
        }
        if (i < ii - 1) {
          searchTerms.push(null);
        }
      }
    }

    return Promise.all(_.map(searchTerms, function(searchTerm) {
      var xchgRegexp = new RegExp('(.+):(.+)');
      if (searchTerm === null) {
        return []; // Simulate an empty result set
      } else {
        /* If colon is in term we are expecting it to be formated as
         * exchange:term
         */
        var xchgRegexResult = xchgRegexp.exec();
        var xchg = null;
        if (!_.isNull(xchgRegexResult)) {
          //TODO make sure there is only one colon
          xchg = xchgRegexResult[1];
          //TODO map various known exchanges with internal symbols
          searchTerm = xchgRegexResult[2];
        }
        return rds.models.Symbol.findSymbol(searchTerm, xchg);
      }
    }));
  }).then(function(results){
    _.each(results, function(matches, idx) {
      var firstMatch = _.first(matches);
      if (firstMatch) {
        result.valid.splice(idx, 0, firstMatch.ticker);
      } else if (_.isString(searchTerms[idx])){
        result.invalid = result.invalid.concat(searchTerms[idx].split(' '));
      }
    });

    return result;
  });
}

/**
 * Return formatted message
 * @param  {Object}   symbols     Symbols to get price quotes for, containing
 *                                valid and invalid arrays
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
      // We might not have every Yahoo symbol
      symbols: symbols.valid.concat(symbols.invalid),
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
            title_link: util.getRedirectUri(`https://finance.yahoo.com/q?s=${data.symbol}`),
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

/**
 * Return array with with stock strings
 * @param  {String} to be parsed
 * @return {Array} of stock strings
 */
function parseStockQuote(str) {
  return str.match(stockRegex);
}

/**
 * Return stock regex string
 * @return {String} to be used by botkit listener
 */
function getStockListenRegex() {
  return '(\\$' + stockRegexString + ')';
}

module.exports = {
  messageQuote: messageQuote,
  matchSymbols: matchSymbols,
  parseStockQuote: parseStockQuote,
  getStockListenRegex: getStockListenRegex
};

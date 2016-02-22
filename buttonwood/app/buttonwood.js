/**
 * Contains the business logic for constructing responses
 */
var _ = require('lodash');
var accounting = require('accounting');
var exchangeMap = require('./exchange-mapping.js');
var logger = require('@the-brain-trust/logger');
var moment = require('moment');
var number = require('../lib/number');
var parseString = require('xml2js').parseString;
var querystring = require('querystring');
var rds = require('@the-brain-trust/rds');
var request = require('request');
var util = require('@the-brain-trust/utility');
var yahooFinance = require('yahoo-finance');

var stockRegexString = '(?:<http:\/\/)?(?!\\d+(.\\d+)?[gkmb])(?=[\\.\\d\\^:@]*[a-z])([a-z\\.\\d\\^:@]+)';
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
  var exchangeRegexp = new RegExp('(.+):(.+)');
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
      var exchangeRegexResult;
      var exchange = undefined;
      if (searchTerm === null)
        return []; // Simulate an empty result set
      /* If colon is in term we are expecting it to be formated as
       * exchange:term
       */
      exchangeRegexResult = exchangeRegexp.exec(searchTerm);
      if (exchangeRegexResult instanceof Object) {
        exchange = exchangeMap.get(exchangeRegexResult[1]);
        searchTerm = exchangeRegexResult[2];
        if(_.isString(exchange)) {
          //TODO Terence need to batch all colon calls into one query
          return rds.models.Symbol.findAll({
            attributes: ['ticker'],
            where: {
              ticker: searchTerm,
              exchange: exchange
            }
          });
        }
      }
      return rds.models.Symbol.findSymbol(searchTerm);
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
 * Return raw list of quotes
 * @param  {Object}   symbols     Symbols to get price quotes for, containing
 *                                valid and invalid arrays
 * @param  {String[]} isDetailed  Provide more information than necessary
 * @return {Promise}              Promise containing quotes list
 */
function getQuotes(symbols, isDetailed) {
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

  return yahooFinance.snapshot({
      symbols: symbols,
      fields: isDetailed ? fieldsBasic.concat(fieldsDetailed) : fieldsBasic
    });
}

/**
 * Return formatted message
 * @param  {Object}   symbols     Symbols to get price quotes for, containing
 *                                valid and invalid arrays
 * @param  {String[]} isDetailed  Provide more information than necessary
 * @return {Promise}              Promise containing quotes for Slack
 */
function messageQuote(symbols, isDetailed) {

  var priceTpl = _.template(
    '<%= symbol %> (<%= name %>) last traded at $<%= lastTradePriceOnly %>.'
    );
  var notFoundTpl =_.template(
    '<%= symbol %> doesn\'t look like a valid symbol.'
    );

  var allSymbols = [];
  var colonSymbols = [];
  var invalidColonAttachments = [];
  var combinedSymbols = symbols.valid.concat(symbols.invalid || []);

  //Symbols with ':' do not work well with Yahoo API remove them
  for (var i = 0, ii = combinedSymbols.length; i < ii; i++) {
    if (/:/.test(combinedSymbols[i])) {
      colonSymbols.push(combinedSymbols[i]);
    } else {
      allSymbols.push(combinedSymbols[i]);
    }
  }
  invalidColonAttachments = _.map(colonSymbols, (function(symbol) {
    return {
      fallback: notFoundTpl({symbol}),
      text: notFoundTpl({symbol}),
      mrkdwn_in : ['text']
    };
  }));

  if (allSymbols.length === 0) {
    logger.warn('no symbols');
    return Promise.resolve({
      attachments: invalidColonAttachments
    });
  }

  return getQuotes(allSymbols, isDetailed)
    .then(function (snapshots) {
      var isCompact = allSymbols.length > 2;
      var lastTradeDateMaximum;
      var attachments = _.map(snapshots, function(data) {
        var attachmentFieldsBasic, attachmentFieldsDetailed;
        logger.debug(data);

        if (_.isEmpty(data.name)) {
          return {
            fallback: notFoundTpl(data),
            text: notFoundTpl(data),
            mrkdwn_in : ['text']
          };
        } else if (isCompact && isDetailed === false) {
          lastTradeDateMaximum = moment.max([
            moment(`${moment(data.lastTradeDate).format('LL')} ${data.lastTradeTime}`, 'LLL'),
            lastTradeDateMaximum || moment(0)
            ]);
          return {
            fallback: priceTpl(data),
            color: number.color(data.changeInPercent),
            text: _.template('<<%= link %>|*<%= symbol %> (<%= name %>)*>\n*<%= lastTrade %>*<%= change %>')({
              symbol: data.symbol,
              name: data.name,
              link: util.getRedirectUri(`https://finance.yahoo.com/q?s=${data.symbol}`),
              lastTrade: _.padRight(accounting.formatMoney(data.lastTradePriceOnly), 10),
              change: `${number.sign(data.change)}${Math.abs(data.change)} (${number.sign(data.changeInPercent)}${number.toPercent(Math.abs(data.changeInPercent))})`
            }),
            mrkdwn_in : ['text']
          };
        } else {
          attachmentFieldsBasic = [{
            title: 'Last Trade',
            value: `${accounting.formatMoney(data.lastTradePriceOnly)}`,
            short: true
          }, {
            title: 'Change',
            value: `${number.sign(data.change)}${Math.abs(data.change)} (${number.sign(data.changeInPercent)}${number.toPercent(Math.abs(data.changeInPercent))})`,
            short: true
          }];

          attachmentFieldsDetailed = [{
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
      }).concat(invalidColonAttachments);

      var result = {
        attachments: attachments
      };

      if (isCompact && lastTradeDateMaximum instanceof moment) {
        result.text = `*${lastTradeDateMaximum.format('LLL')}*`;
      }

      return result;
    });
}

/**
 * Return formatted message containing relevant news
 * @param  {Object} symbols Symbols to get price quotes for, containing
 *                          valid and invalid arrays
 * @return {Promise}        Promise containing news for Slack
 */
function messageNews(symbols) {
  return new Promise(function(resolve, reject) {
    request(`http://www.fool.com/feeds/tickerfeed.aspx?${querystring.stringify({ s: symbols.valid })}`,
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
          parseString(body, function (err, result) {
            var attachments;
            if (err) {
              reject(err);
            } else {
              if (_.isArray(result.rss.channel[0].item)) {
                attachments = _.map(result.rss.channel[0].item.splice(0, 3), function(item) {
                  return {
                    title: `${item.title}`,
                    title_link: item.link[0] + '?' + querystring.stringify({
                      source: 'braintrust',
                      utm_campaign: 'article',
                      utm_medium: 'feed',
                      utm_source: 'braintrust'
                    }),
                    text: `*${moment(item.pubDate[0]).tz('America/New_York').format('LLL')} ET*\n${item.description}`,
                    mrkdwn_in: ['text']
                  };
                });
              } else {
                attachments = [{
                  text: 'No news found. Please check your symbols.'
                }];
              }

              logger.debug(attachments);

              resolve({
                attachments: attachments
              });
            }
          });
        } else {
          reject(error);
        }
      });
    });
}

/**
 * Push portfolio summaries
 * @return {Object} Contains messages for portfolio summaries
 */
function getPortfolioSummaries() {
  /**
   * Get message text. Message is different if firstPush is set on portfolio,
   * set firstPush attribute to false once message is delivered.
   * @return {String}
   */
  function getMessageText(portfolio) {
    var text = '';

    if (portfolio.firstPush === true) {
      text = ['Hi there! I\'ll be providing portfolio summaries every weekday ',
        'after US markets close at 4:20 PM ET. If you don\'t want these ',
        'summaries, just say *stop summaries*.\n'
        ].join('');

      // TODO: place in callback on successful push only
      portfolio.update({
        firstPush: false
      });
    }

    text += `*Portfolio Summary - ${moment().format('LL')}*`;

    return text;
  }


  return rds.models.Portfolio.findAll({
    where: {
      summary: {
        $ne: null
      }
    },
    include: [{
      model: rds.models.PlatformEntity,
      required: true,
      include: [{
        model: rds.models.PlatformEntity,
        required: true,
        include: [{
          model: rds.models.ApplicationPlatformEntity,
          required: true
        }]
      }]
    }]
  }).then(function(portfolios) {
    var symbols = _.uniq(_.reduce(portfolios, function(accum, portfolio) {
      return accum.concat(portfolio.symbols);
    }, []));

    symbols = symbols || [];

    return Promise.all([portfolios, symbols, messageQuote({
      valid: symbols
    }, false)]);
  }).then(function(tuple) {
    return new Promise(function (resolve, reject) {
      try {
        var portfolios = tuple[0];
        var symbols = tuple[1];
        var message = tuple[2];

        var symbolsHash =_.indexBy(message.attachments, function(attachments, idx) {
          return symbols[idx];
        });

        // The base platform entity should correspond to a team, its children
        // should be reflect a user
        resolve(_.compact(_.map(portfolios, function(portfolio) {
          if (portfolio.symbols.length === 0) {
            return;
          }

          var attachments = _.map(portfolio.symbols, function(symbol) {
            return symbolsHash[symbol];
          });

          return {
            // Assumes there is only one platform (Slack)
            applicationPlatformEntity: portfolio.PlatformEntity
                                                .PlatformEntity
                                                .ApplicationPlatformEntities[0],
            platformEntity: portfolio.PlatformEntity,
            message: {
              text: getMessageText(portfolio),
              attachments: attachments
            }
          };
        })));
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * Sets the portfolio summary frequency.
 * @param   {Object}                  options
 * @param   {PlatformEntity|Object}   options.platformEntity  The user associated with portfolio
 * @param   {String|undefined}        options.summary         Summary frequency
 */
function setPortfolioSummary(options) {
  /**
   * Get the applicable PlatformEntity object
   * @see setPortfolioSummary
   * @return {Array}          Tuple of PlatformEntity and created value
   */
  function getPlatformEntity(options) {
    if (options.platformEntity instanceof rds.models.PlatformEntity.Instance) {
      return Promise.resolve([options.PlatformEntity, false]);
    } else {
      return rds.models.Platform.findOne({
        where: {
          name: 'slack'
        }
      }).then(function(platform) {
        return rds.models.PlatformEntity.findOrCreate({
          where: _.merge(options.platformEntity, {
            kind: 'user',
            platform_id: platform.id
          })
        });
      });
    }
  }

  return getPlatformEntity(options)
    .then(function(tuple){
      return rds.models.Portfolio.findOrCreate({
        where: {
          platform_entity_id: tuple[0].id
        }
      });
    })
    .then(function(tuple) {
      return tuple[0].update({
        summary: options.summary
      });
    });
}

/**
 * Return array with with stock strings
 * @param  {String} to be parsed
 * @return {Array} of stock strings
 */
function parseStockQuote(str) {
  var matches = [];
  var match;
  while ((match = stockRegex.exec(str)) instanceof Object) {
    matches.push(match[2]);
  }
  return matches;
}

/**
 * Return stock regex string
 * @return {String} to be used by botkit listener
 */
function getStockListenRegex() {
  return '(\\$' + stockRegexString + ')';
}

module.exports = {
  messageNews: messageNews,
  getQuotes: getQuotes,
  messageQuote: messageQuote,
  matchSymbols: matchSymbols,
  parseStockQuote: parseStockQuote,
  getPortfolioSummaries: getPortfolioSummaries,
  setPortfolioSummary: setPortfolioSummary,
  getStockListenRegex: getStockListenRegex
};

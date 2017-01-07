/**
 * Contains the business logic for constructing responses
 */
const _ = require('lodash');
const amazonProductApiClient = require('../lib/amazon-product-api.js');
const logger = require('@the-brain-trust/logger');

// Naive filter for purchase intent
const purchaseIntent = '(buy|shop|purchase)';
const notFoundText = 'marcopolo couldn\'t find anything in his travels. Perhaps try a different name.';
const numberOfResults = 3; //number of results to show by default

/**
 * Return raw list of quotes
 * @param  {String[]} products    String of product names
 * @param  {String[]} isDetailed  Provide more information than necessary
 * @return {Promise}              Promise containing quotes list
 */
function getAmazonResults(products) {
  return amazonProductApiClient.itemSearch({
    searchIndex: 'All',
    responseGroup: 'ItemAttributes,Offers,Images',
    keywords: products[0]
  });
}

/**
 * Return stock regex string
 * @return {String} to be used by botkit listener
 */
function getPurchaseIntent() {
  return purchaseIntent;
}

/**
 * Return formatted message
 * @param  {Object}   products    Product names to get product quotes for
 * @return {Promise}              Promise containing quotes for Slack
 */
function messageAmazonResults(products) {
  /**
   * Extract price from an Amazon result. Will use offer price if available.
   * @param  {Object} item Amazon search result item
   * @return {String}      Formatted price of Amazon search result item
   */
  function getPrice(item) {
    var result = 'No Price Information';

    if (item.ItemAttributes[0].ListPrice) {
      const listPrice = item.ItemAttributes[0].ListPrice[0].FormattedPrice[0];
      result = `*${listPrice}*`;

      if (item.OfferSummary) {
        result = `*${item.OfferSummary[0].LowestNewPrice[0].FormattedPrice[0]}* ~${listPrice}~`;
      }
    }

    return result;
  }

  const titleTpl = _.template('<%= title %>');
  const fallbackTpl = _.template('<%= title %>');

  return getAmazonResults(products)
    .then(function (results) {
      var attachments = _.map(results.slice(0, numberOfResults), function(item) {
        logger.debug(item);

        return {
          fallback: fallbackTpl({title: item.ItemAttributes[0].Title}),
          title: titleTpl({title: item.ItemAttributes[0].Title}),
          title_link: item.DetailPageURL[0],
          text: getPrice(item),
          thumb_url: item.SmallImage && item.SmallImage[0].URL[0],
          mrkdwn_in : ['title', 'text']
        };
      });

      if (attachments.length === 0) {
        attachments = [{
          fallback: notFoundText,
          text: notFoundText
        }];
      }

      var result = {
        attachments: attachments
      };

      return result;
    });
}

/**
 * Return array with best guess at products
 * @param  {String} to be parsed
 * @return {Array} of stock strings
 */
function parseProducts(str) {
  var products = ['Harry Potter'];
  return products;
}

module.exports = {
  getAmazonResults: getAmazonResults,
  getPurchaseIntent: getPurchaseIntent,
  messageAmazonResults: messageAmazonResults,
  parseProducts: parseProducts
};

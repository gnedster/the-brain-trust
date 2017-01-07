/**
 * Contains the business logic for constructing responses
 */
const _ = require('lodash');
const amazonProductApiClient = require('../lib/amazon-product-api.js');
const htmlToText = require('html-to-text');
const logger = require('@the-brain-trust/logger');

// Naive filter for purchase intent
const purchaseIntent = '(buy|shop|purchase)';
const notFoundText = 'marcopolo couldn\'t find anything in his travels. Perhaps try a different name.';
const searchTextPretext = 'Here are the top 3 results';
const numberOfResults = 3; //number of results to show by default

/**
 * Return raw list of quotes
 * @param  {String[]} products    String of product names
 * @param  {String[]} isDetailed  Provide more information than necessary
 * @return {Promise}              Promise containing quotes list
 */
function getAmazonResults(product) {
  return amazonProductApiClient.itemSearch({
    keywords: product,
    merchantId: 'Amazon',
    responseGroup: 'ItemAttributes,Offers,Images,EditorialReview',
    searchIndex: 'All'
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
function messageAmazonResults(product) {
  /**
   * @private
   * Extract price from an Amazon result. Will use offer price if available.
   * @param  {Object} item Amazon search result item
   * @return {String}      Formatted price of Amazon search result item
   */
  function getPrice(item) {
    var result = '_no pricing found_';

    if (item.ItemAttributes[0].ListPrice) {
      const listPrice = item.ItemAttributes[0].ListPrice[0].FormattedPrice[0];
      result = `${listPrice}`;

      if (item.Offers && item.Offers[0].Offer &&
        item.Offers[0].Offer[0].OfferAttributes[0].Condition[0] === 'New') {
        const offerListing = item.Offers[0].Offer[0].OfferListing[0];
        const offerPrice = offerListing.Price[0].FormattedPrice[0];
        const amountSaved = offerListing.AmountSaved[0].FormattedPrice[0];
        const percentageSaved = offerListing.PercentageSaved[0];

        if (offerPrice !== listPrice) {
          result = `${offerPrice} ~${listPrice}~
save: ${amountSaved} (${percentageSaved}%)`;
        }
      }
    }

    return result;
  }

  /**
   * @private
   * Extract product description from an Amazon result.
   * @param  {Object} item Amazon search result item
   * @return {String}      Description of Amazon search result item
   *                       converted from HTML
   */
  function getDescription(item) {
    var result = '_no description found_';

    if (item.EditorialReviews) {
      const productDescription = _.find(item.EditorialReviews, function(review) {
        return review.EditorialReview[0].Source[0] === 'Product Description';
      });

      if (productDescription) {
        const content = productDescription.EditorialReview[0].Content[0];

        if (content.length > 0) {
          result = `${htmlToText.fromString(content, {
            wordwrap: false
          })}`;
        }
      }
    }
    return result;
  }

  const titleTpl = _.template('<%= title %>');
  const fallbackTpl = _.template('<%= title %>');

  return getAmazonResults(product)
    .then(function (results) {
      var attachments = _.map(results.slice(0, numberOfResults), function(item) {
        logger.debug(item);

        return {
          fallback: fallbackTpl({title: item.ItemAttributes[0].Title}),
          text: `*Price*
${getPrice(item)}
*Description*
${getDescription(item)}
`,
          title: titleTpl({title: item.ItemAttributes[0].Title}),
          title_link: item.DetailPageURL[0],
          thumb_url: item.SmallImage && item.SmallImage[0].URL[0],
          mrkdwn_in : ['text']
        };
      });

      if (attachments.length === 0) {
        attachments = [{
          fallback: notFoundText,
          text: notFoundText
        }];
      }

      var result = {
        attachments: attachments,
        text: `${searchTextPretext} for *${product}*:`
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
  var products = 'Harry Potter';
  return products;
}

module.exports = {
  getAmazonResults: getAmazonResults,
  getPurchaseIntent: getPurchaseIntent,
  messageAmazonResults: messageAmazonResults,
  parseProducts: parseProducts
};

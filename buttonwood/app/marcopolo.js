/**
 * Contains the business logic for constructing responses
 */
var _ = require('lodash');
var amazonProductApi = require('amazon-product-api');
var logger = require('@the-brain-trust/logger');
var util = require('@the-brain-trust/utility');

// Naive filter for purchase intent
var purchaseIntentRegex = /(buy|shop|purchase)/i;

var searchResultTpl = _.template(
  '<%= title %>'
  );

var notFoundText = 'marcopolo couldn\'t find anything in his travels. Perhaps try a different name.';

const amazonProductApiClient = amazonProductApi.createClient({
  awsId: process.env.AWS_ACCESS_KEY_ID,
  awsSecret: process.env.AWS_SECRET_ACCESS_KEY,
  awsTag: process.env.AMAZON_ASSOCIATE_TAG
});

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
 * Return formatted message
 * @param  {Object}   products    Product names to get product quotes for
 * @return {Promise}              Promise containing quotes for Slack
 */
function messageAmazonResults(products) {
  return getAmazonResults(products)
    .then(function (results) {
      var attachments = _.map(results, function(item) {
        logger.debug(item);

        return {
          fallback: searchResultTpl({title: item.ItemAttributes.Title}),
          title: _.template('<%= title %>')({title: item.ItemAttributes.Title}),
          title_link: util.getRedirectUri(item.DetailPageURL),
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

/**
 * Return stock regex string
 * @return {String} to be used by botkit listener
 */
function getPurchaseIntentRegex() {
  return purchaseIntentRegex;
}

module.exports = {
  getAmazonResults: getAmazonResults,
  getPurchaseIntentRegex: getPurchaseIntentRegex,
  messageAmazonResults: messageAmazonResults,
  parseProducts: parseProducts
};

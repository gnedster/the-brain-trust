/**
 * Contains the business logic for constructing responses
 */
const _ = require('lodash');
const amazonProductApiClient = require('../lib/amazon-product-api.js');
// const htmlToText = require('html-to-text');
const logger = require('@the-brain-trust/logger');
// const nodePos = require('node-pos');

const amazonLinkFormat = 'https?://www.amazon.com/([\\w-]+/)?(dp|gp/product)/(\\w+/)?(\\w{10})';
const amazonLinkFormatRegex = new RegExp(amazonLinkFormat);
// Naive filter for purchase intent

const notFoundText = 'marcopolo couldn\'t find anything in his travels. Perhaps try a different name.';
const numberOfResults = 3; //number of results to show by default
const searchTextPretext = 'Here are the top 3 results';

/**
 * @private
 * Generate a Slack attachment for a given Amazon item
 * @param {Object}   Amazon product api item
 * @return {Object}  Slack message
 */
function generateAttachments(item) {
  /**
   * @private
   * Extract price from an Amazon result. Will use offer price if available.
   * @param  {Object} item Amazon search result item
   * @return {String}      Formatted price of Amazon search result item
   */
  function getPrice(item) {
    var result = '_no pricing found_';

    if (item.ItemAttributes[0] && item.ItemAttributes[0].ListPrice) {
      const listPrice = item.ItemAttributes[0].ListPrice[0].FormattedPrice[0];
      result = `${listPrice}`;

      if (item.Offers && item.Offers[0].Offer &&
        item.Offers[0].Offer[0].OfferAttributes[0].Condition[0] === 'New') {
        const offerListing = item.Offers[0].Offer[0].OfferListing[0];
        const offerPrice = offerListing.Price[0].FormattedPrice[0];

        const amountSaved = offerListing.AmountSaved && offerListing.AmountSaved[0].FormattedPrice[0];
        const percentageSaved = offerListing.PercentageSaved && offerListing.PercentageSaved[0];

        if (offerPrice !== listPrice && amountSaved && percentageSaved) {
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
  // function getDescription(item) {
  //   var result = '_no description found_';

  //   if (item.EditorialReviews) {
  //     const productDescription = _.find(item.EditorialReviews, function(review) {
  //       return review.EditorialReview[0].Source[0] === 'Product Description';
  //     });

  //     if (productDescription) {
  //       const content = productDescription.EditorialReview[0].Content[0];

  //       if (content.length > 0) {
  //         result = `${htmlToText.fromString(content, {
  //           wordwrap: false
  //         })}`;
  //       }
  //     }
  //   }
  //   return result;
  // }

  const titleTpl = _.template('<%= title %>');
  const fallbackTpl = _.template('<%= title %>');

  logger.debug(item);

  if (item.ItemAttributes && item.ItemAttributes[0]) {
    return {
      fallback: fallbackTpl({title: item.ItemAttributes[0].Title}),
      text: `*Price*
  ${getPrice(item)}
  `,
      title: titleTpl({title: item.ItemAttributes[0].Title}),
      title_link: item.DetailPageURL[0],
      thumb_url: item.SmallImage && item.SmallImage[0].URL[0],
      mrkdwn_in : ['text']
    };
  }
}

/**
 * From https://stackoverflow.com/questions/1764605/scrape-asin-from-amazon-url-using-javascript,
 * we use the url format to detect when an Amazon link has been pasted into the browser.
 * @return {String} to be used by botkit listener
 */
function getAmazonLinkFormat() {
  return amazonLinkFormat;
}

/**
 * From a given message containing an A
 * @param  {[type]} message [description]
 * @return {[type]}         [description]
 */
function messageAmazonLookup(message) {
  const matches = message.match(amazonLinkFormatRegex);
  const asin = matches[4];

  return amazonProductApiClient.itemLookup({
      itemId: asin,
      responseGroup: 'ItemAttributes,Offers,Images,EditorialReview'
    }).then(function(result){
      return {
        attachments: [generateAttachments(result[0])]
      };
    });
}

/**
 * Return formatted message
 * @param  {Object}   products    Product names to get product quotes for
 * @return {Promise}              Promise containing quotes for Slack
 */
function messageAmazonResults(product) {
  return amazonProductApiClient.itemSearch({
      keywords: product,
      responseGroup: 'ItemAttributes,Offers,Images,EditorialReview',
      searchIndex: 'Blended'  //All, UnboxVideo, Appliances, MobileApps, ArtsAndCrafts, Automotive, Baby, Beauty, Books, Music, Wireless, Fashion, FashionBaby, FashionBoys, FashionGirls, FashionMen, FashionWomen, Collectibles, PCHardware, MP3Downloads, Electronics, GiftCards, Grocery, HealthPersonalCare, HomeGarden, Industrial, KindleStore, Luggage, Magazines, Movies, MusicalInstruments, OfficeProducts, LawnAndGarden, PetSupplies, Pantry, Software, SportingGoods, Tools, Toys, VideoGames, Wine
    }).then(function (results) {
      results = _.filter(results, function(result) {
        return _.has(result, 'ItemAttributes');
      });

      var attachments = _.map(results.slice(0, numberOfResults),
        generateAttachments);

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
// function parseProduct(text) {
//   function extractNouns(phrase) {
//     return new Promise(function(resolve, reject) {
//       nodePos.partsOfSpeech(phrase, function(data) {
//         console.log(data[0]);
//         const words = _.map(data[0], function(word) {

//           if (word.pos.length === 0 || _.includes(word.pos, 'Noun')) {
//             return word.word;
//           }
//         });
//         resolve(words.join(' '));
//       });
//     });
//   }

//   return new Promise(function(resolve, reject) {
//     nodePos.findPhrases(text, function(data) {
//       var phrase = _.find(data, function(phrase) {
//         return phrase.type === 'Verb Phrase' && _.includes(purchaseActionWords,
//           phrase.phrase[0].toLowerCase());
//       });

//       if (phrase) {
//         phrase = phrase.phrase.join(' ');
//       } else {
//         phrase = text;
//       }

//       resolve(phrase);
//     });
//   }).then(extractNouns);
// }

module.exports = {
  generateAttachments: generateAttachments,
  getAmazonLinkFormat: getAmazonLinkFormat,
  messageAmazonResults: messageAmazonResults,
  messageAmazonLookup: messageAmazonLookup
};

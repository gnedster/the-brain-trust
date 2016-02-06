var _ = require('lodash');
var CronJob = require('cron').CronJob;
var buttonwood = require('./app/buttonwood');
var botManager = require('./lib/bot-manager');

/**
 * Push portfolio summaries to users
 */
function pushSummaries() {
  buttonwood.getPortfolioSummaries().then(function(portfolioSummaries) {
    _.each(portfolioSummaries, function(portfolioSummary) {
      var bot = botManager.getBot(portfolioSummary.applicationPlatformEntity);
      bot.sendPrivateMessage(portfolioSummary);
    });
  });
}

function init() {
  // Push summaries at 4:20 PM ET every weekday.
  new CronJob('00 20 16 * * 1-5',
    pushSummaries,
    null,
    true,
    'America/New_York');
}

module.exports = {
  init: init
};

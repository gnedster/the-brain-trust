var _ = require('lodash');
var CronJob = require('cron').CronJob;
var buttonwood = require('./app/buttonwood');
var bot = require('@the-brain-trust/bot');

/**
 * Push portfolio summaries to users
 */
function pushSummaries() {
  buttonwood.getPortfolioSummaries().then(function(portfolioSummaries) {
    _.each(portfolioSummaries, function(portfolioSummary) {
      var botInstance = bot.botManager.getBot(portfolioSummary.applicationPlatformEntity);
      botInstance.sendPrivateMessage(portfolioSummary);
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

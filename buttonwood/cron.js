var _ = require('lodash');
var CronJob = require('cron').CronJob;
var buttonwood = require('./app/buttonwood');
var botManager = require('./lib/bot-manager');

function init() {
  // Push summaries at 4:20 PM ET every weekday.
  new CronJob('00 16 20 * * 1-5',
    function() {
      _.each(buttonwood.getPortfolioSummaries(), function(portfolioSummary) {
        var bot = botManager.getBot(portfolioSummary.applicationPlatformEntity);
        bot.sendPrivateMessage(portfolioSummary);
      });
    },
    null,
    true,
    'America/New_York');
}

module.exports = {
  init: init
};

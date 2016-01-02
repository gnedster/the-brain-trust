var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');
var _ = require('lodash');
var Bot = require('./bot.js');
/**
 * Map Object to hold all bot instances
 */
var botInstanceMap = new Map();

//TODO Create sqs listener

/**
 * Create bot object if bot does not already exist
 * @param {ApplicationPlatformEntity} instance  an ApplicationPlatformEntity
 *        which contains info on bot to possibly be created
 */
function createBot(instance) {
  var id = instance.id;
  var queryMap = botInstanceMap.get(id);
  var bot;
  if (_.isUndefined(queryMap)) {
    //TODO parse which bot and pass in relavent info
    bot = new Bot(instance.credentials.bot.bot_access_token);
    //TODO
    bot.listen();
    botInstanceMap.set(id, bot);
    logger.info('Bot:' + id + ' created');
  } else {
    logger.info('Bot:' + id + ' already created');
  }
}


function spawnBot(platformName, ApplicationName)
{
  var platformId, applicationId;
  var promiseSlackerPlatform, promiseSlackerApplication;

  /* Returns Promise for querying for platform ID */
  promiseSlackerPlatform = rds.models.Platform.findOne({
        name: platformName
      });

  promiseSlackerApplication = rds.models.Application.findOne({
        name: ApplicationName
      });
  promiseSlackerPlatform.then(function (platform){
    if (_.isUndefined(platform)){
      //TODO error out
    }
    platformId = platform.id;
    //TODO now read back application id and then call findAll
  });
/**
 * Initialize all bot instances withing RDS to run
 */
  //TODO use results
  rds.models.ApplicationPlatformEntity.findAll().then(function(results){
    results.forEach(function(instance) {
      createBot(instance);
    });
  });
}

spawnBot('slack', 'buttonwood');

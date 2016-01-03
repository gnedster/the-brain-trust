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


function spawnBot(platformName, applicationName)
{
  var platformId, applicationId;
  var promiseSlackerPlatform, promiseSlackerApplication;

  /* Returns Promise for querying for platform ID */
  promiseSlackerPlatform = rds.models.Platform.findOne({
      where: {
        name: platformName
      }});
  promiseSlackerApplication = rds.models.Application.findOne({
        name: applicationName
      });

//TODO need to figure out how to handle errors
  /* Wait for responses from above Promises */
  promiseSlackerPlatform.then(function (platform){
    if (_.isNull(platform)){
      //TODO error out
      logger.error('platform ' + platformName + ' could not be found');
    } else {
      platformId = platform.id;
    }
    return promiseSlackerApplication;
  }).then(function (application){
    if (_.isNull(application)){
      //TODO error out
      logger.error('application ' + applicationName + ' could not be found');
    }
    applicationId = application.id;
    logger.info('TMsg plat ' + platformId + ' apps ' + applicationId);
    return rds.models.ApplicationPlatformEntity.findAll({
      where: {
        application_id : applicationId,
        platform_id: platformId}});
  }).then(function(results){
    /**
     * Initialize all bot instances withing RDS to run
     */
logger.info('TMsg start ' + platformName + ' ' + applicationName)
    results.forEach(function(instance) {
      createBot(instance);
    });
  });
}

spawnBot('slack', 'buttonwood');

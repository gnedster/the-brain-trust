var _ = require('lodash');
var Bot = require('./lib/bot');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');

/**
 * Map Object to hold all bot instances
 */
var botInstanceMap = new Map();

// TODO: Create sqs listener

/**
 * Create bot object if bot does not already exist
 * @param {ApplicationPlatformEntity} applicationPlatformEntity  An ApplicationPlatformEntity
 *                                                               which contains info on bot to
 *                                                               possibly be created
 */
function createBot(applicationPlatformEntity) {
  var bot, token;
  var id = applicationPlatformEntity.id;
  var botInstance = botInstanceMap.get(id);

  if (botInstance instanceof Bot) {
    logger.info('bot for applicationPlatformEntity', id, 'already created.');
  } else {
    token = _.get(applicationPlatformEntity,
      'credentials.bot.bot_access_token'
      );

    if (_.isString(token)) {
//TODO more token sanity check needed
      bot = new Bot(token);
      bot.listen();
      botInstanceMap.set(id, bot);
      logger.info('bot for applicationPlatformEntity', id, 'created.');
    } else {
      logger.warn('invalid token for applicationPlatformEntity', id);
    }
  }
}

/**
 * Initialize set of listeners
 * @param  {String} platformName     Platform to initialize bots against
 * @param  {String} applicationName  Application to initialize bots against
 */
function initializeBots(platformName, applicationName) {
  Promise.all([
    rds.models.Platform.findOne({
      where: {
        name: platformName
      }
    }),
    rds.models.Application.findOne({
      where: {
        name: applicationName
      }
    })]).then(function(results) {
      var platform = results[0];
      var application = results[1];
      if (platform instanceof rds.models.Platform.Instance &&
        application instanceof rds.models.Application.Instance) {

        return rds.models.ApplicationPlatformEntity.findAll({
          where: {
            application_id : application.id,
            platform_id: platform.id
          }
        });
      } else {
        if (_.isNull(platform)) {
          logger.warn('no platform with name', platformName);
        }

        if (_.isNull(application)) {
          logger.warn('no application with name', applicationName);
        }

        return Promise.resolve([]);
      }
    }).then(function(applicationPlatformEntities) {
      if (applicationPlatformEntities[0]) {
        _.each(applicationPlatformEntities,
          function(applicationPlatformEntity) {
            createBot(applicationPlatformEntity);
          });
      } else {
        logger.warn('no permissions found for', platformName, applicationName);
      }
    }).catch(function(err) {
      logger.error(err);
    });
}

module.exports = {
  initializeBots: initializeBots
};

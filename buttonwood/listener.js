var _ = require('lodash');
var Bot = require('./lib/bot');
var ButtonwoodBot = require('./bot/buttonwood');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');
var sqs = require('@the-brain-trust/sqs');
var util = require('@the-brain-trust/utility');

const queueName = 'application';

/**
 * Map Object to hold all bot instances
 */
var botInstanceMap = new Map();

/**
 * Create bot object if bot does not already exist
 * @param {ApplicationPlatformEntity} applicationPlatformEntity  An ApplicationPlatformEntity
 *                                                               which contains info on bot to
 *                                                               possibly be created
 */
function createBot(applicationPlatformEntity) {
  var bot, botInstance, token;
  var id = applicationPlatformEntity.id;

  token = _.get(applicationPlatformEntity,
    'credentials.bot.bot_access_token'
    );
  if (_.isString(token)) {
    botInstance = botInstanceMap.get(token);
  } else {
    logger.warn('invalid token for applicationPlatformEntity', id);
    return;
  }

  if (botInstance instanceof Bot) {
    logger.info('bot for applicationPlatformEntity', id, 'already created.');
  } else {
    bot = new ButtonwoodBot(token);
    bot.listen();
    botInstanceMap.set(token, bot);
    logger.info('bot for applicationPlatformEntity', id, 'created.');
  }
}

/**
 * Initialize set of listeners
 * @param  {String} platformName     Platform to initialize bots against
 * @param  {String} applicationName  Application to initialize bots against
 * @return {Promise}
 */
function initializeBots(platformName, applicationName) {
  logger.info('initializing bots for', platformName, applicationName);
  return Promise.all([
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
      return new Promise(function(resolve, reject) {
        try {
          if (applicationPlatformEntities[0]) {
            _.each(applicationPlatformEntities,
                function(applicationPlatformEntity) {
                  createBot(applicationPlatformEntity);
                });
          } else {
            logger.warn('no permissions found for', platformName, applicationName);
          }
          resolve();
        } catch(err) {
          reject(err);
        }
      });

    }).catch(function(err) {
      logger.error(err);
    });
}

/**
 * Initialize th function to listen for SQS messages. This function
 * recursively calls itself indefinitely.
 * @param  {String}   queueName Queue name to listen to messages against
 * @return {Promise}
 */
function initializeSqsListener(platformName, applicationName, queueName) {
  return sqs.pollForMessages(queueName, true)
    .then(function(data){
      // TODO: Use data provided by queue instead of attempting to
      // initialize bots again

      if (_.get(data, 'Messages')) {
        return initializeBots(platformName, applicationName);
      } else {
        return new Promise(function(resolve, reject) {
          // Artifical delay of 3 seconds
          setTimeout(resolve, 3000);
        });
      }
    })
    .then(function() {
      // Unsure whether or not we need to wrap this promise
      return new Promise(function(resolve, reject) {
        initializeSqsListener(platformName, applicationName, queueName);
        resolve();
      });
    })
    .catch(function(err) {
      logger.error(err);
    });
}

function init(platformName, applicationName){
  initializeBots(platformName, applicationName);
  if (util.isProduction()) {
    initializeSqsListener(platformName, applicationName, queueName);
  }
}

module.exports = {
  init: init
};

var _ = require('lodash');
var Bot = require('./botkit-wrapper.js');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');
var rdsHelper = require('./lib/rds-helper.js');

// Contains all created bot instances, key is applicationPlatformEntity id
const bots = new Map();
const platformName = 'slack';

/**
 * Create all bot objects
 * @param {Object} registry Contains key-value pair of applicationNames
 *                          and corresponding bot Class to initialize
 * @return {Promise} Create bots
 */
function init(registry) {
  return Promise.all([_.mapKeys(registry, function(value, key, object) {
    return rdsHelper.getApplicationPlatformEntities(platformName, key)
      .then(function(applicationPlatformEntities) {
        return create(applicationPlatformEntities, value);
      });
  })]);
}

/**
 * Create bot object if bot does not already exist
 * @param   {ApplicationPlatformEntity[]} applicationPlatformEntities
 *          A collection of ApplicationPlatformEntity for initialization
 * @param   {Bot} BotClass  A class which prototypes the Bot class {@link botkit-wrapper.js}
 * @return  {Promise}       A promise containing the bots created
 */
function create(applicationPlatformEntities, BotClass) {
  return new Promise(function(resolve, reject) {
    try {
      var result = _.map(applicationPlatformEntities,
        function(applicationPlatformEntity) {

        var id = applicationPlatformEntity.id;
        var botInstance;

        if (bots.has(id) === false) {
          // Lazy retrieval of bot classes
          if (_.isUndefined(BotClass) || (BotClass.prototype instanceof Bot === false)) {
            logger.warn('could not find bot class');
          }
          // Dynamic initialization
          var applicationClass = BotClass || Bot;
          botInstance = Object.create(applicationClass.prototype);
          applicationClass.apply(botInstance, [applicationPlatformEntity]);

          bots.set(id, botInstance);
          botInstance.start();
          return botInstance;
        } else {
          botInstance = bots.get(id);
          if (botInstance.getStatus() === 'error') {
            /* This is a re-authorization */
            botInstance.setApplicationPlatformEntity(applicationPlatformEntity);
            botInstance.start();
          }
          return botInstance;
        }
      });
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Get bot given an applicationPlatformEntity
 * @param  {ApplicationPlatformEntity} applicationPlatformEntity
 * @return {Bot|undefined}             Bot
 */
function getBot(applicationPlatformEntity) {
  return bots.get(applicationPlatformEntity.id);
}

/**
 * Get statuses for a subset or entire collection of bots
 * @param {ApplicationPlatformEntity[]} [applicationPlatformEntities]
 *        A collection of ApplicationPlatformEntity for initialization
 * @return {Map}  Map containing id of bots and status
 */
function getStatus(applicationPlatformEntities) {
  var result = new Map();
  if (applicationPlatformEntities) {
    _.each(applicationPlatformEntities, function(applicationPlatformEntity) {
      var bot = bots.get(applicationPlatformEntity.id);
      var status = bot instanceof bot.Bot ?
          bot.getStatusTimestamp() : 'not created';
      result.set(applicationPlatformEntity.id, status);
    });
  } else {
    bots.forEach(function(bot) {
      result.set(bot.getId(), bot.getStatusTimestamp());
    });
  }

  return result;
}

/**
 * Populate Slack users for all active bots.
 */
function populateUsers() {
  rds.models.Platform.findOne({
    where: {
      name: 'slack'
    }
  }).then(function(platform) {
    for (var bot of bots.values()) {
      bot.bot.api.users.list({}, function(err,response) {
        _.each(response.members, function(member) {
          rds.models.PlatformEntity.findCreateFind({
            where: {
              entityId: member.id,
              platform_id: platform.id,
              kind: 'user',
              parent_id: bot.applicationPlatformEntity.platform_entity_id
            }
          });
        });
      });
    }
  });
}

module.exports = {
  init: init,
  create: create,
  getBot: getBot,
  getStatus: getStatus,
  populateUsers: populateUsers
};

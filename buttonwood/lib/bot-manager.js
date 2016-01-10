var _ = require('lodash');
var Bot = require('./bot');
var registry = require('../bot/registry');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');

// Contains all created bot instances, key is applicationPlatformEntity id
const bots = new Map();
const platformName = 'slack';

/**
 * Create all bot objects
 * @return {Promise} Create bots
 */
function init() {
  return rds.models.Platform.findOne({
      where: {
        name: platformName
      },
      include: [
        {
          model: rds.models.ApplicationPlatformEntity,
          include: [
            rds.models.Application
          ]
        }
      ]
    })
    .then(function(platform) {
      if (platform instanceof rds.models.Platform.Instance) {
        return platform.getApplicationPlatformEntities();
      }

      return Promise.reject('platform not found');
    })
    .then(create);
}

/**
 * Create bot object if bot does not already exist
 * @param   {ApplicationPlatformEntity[]} applicationPlatformEntities
 *          A collection of ApplicationPlatformEntity for initialization
 * @return  {Promise}     A promise containing the bots created
 */
function create(applicationPlatformEntities) {
  return new Promise(function(resolve, reject) {
    try {
      return Promise.all(
        _.map(applicationPlatformEntities, function(applicationPlatformEntity) {
          var id = applicationPlatformEntity.id,
              bot;
          if (bots.has(id) === false) {
            // Lazy retrieval of bot classes
            return applicationPlatformEntity.getApplication()
              .then(function(application) {
                if (_.isUndefined(registry[application.name])) {
                  logger.warn('could not find bot class', application.name);
                }
                // Dynamic initialization
                var applicationClass = registry[application.name] || Bot;
                bot = Object.create(applicationClass.prototype);
                applicationClass.apply(bot, [applicationPlatformEntity]);
                bots.set(id, bot);
                bot.start();

                return bot;
              });
            } else {
              return Promise.resolve(bots.get(id));
            }
          }));
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Get statuses for a subset or entire collection of bots
 * @param {ApplicationPlatformEntity[]} [applicationPlatformEntities]
 *        A collection of ApplicationPlatformEntity for initialization
 */
function status(applicationPlatformEntities) {
  var result = new Map();
  if (applicationPlatformEntities) {
    _.each(applicationPlatformEntities, function(applicationPlatformEntity) {
      var bot = bots.get(applicationPlatformEntity.id);
      var status = bot instanceof Bot ? bot.getStatus() : 'not created';
      result.set(applicationPlatformEntity.id, status);
    });
  } else {
    this.bots.forEach(function(bot) {
      result.set(bot.getId(), bot.getStatus());
    });
  }
}

module.exports = {
  init: init,
  create: create,
  status: status
};

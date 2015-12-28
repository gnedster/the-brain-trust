var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');
var Bot = require('./bot.js');
/**
 * Map Object to hold all bot instances
 */
var botInstance = new Map();

/**
 * Set up connection to database, initialize models, and run
 * migrations.
 */
rds.sync({logging: logger.stream.write})
  .then(function(){
    logger.info('db initialized.');
  })
  .catch(function(err){
    logger.error(err);
  });

//TODO Create sqs listener

/**
 * Create bot object if bot does not already exist
 * @param {ApplicationPlatformEntity} instance of ApplicationPlatformEntity
 *        model
 */
function createBot(instance) {
  var id = instance.id;
  var queryMap = botInstance.get(id);
  if (queryMap === undefined) {
    //TODO parse which bot and pass in relavent info
    var bot = new Bot(instance.credentials.bot.bot_access_token);
    botInstance.set(id, bot);
    logger.info('Bot:' + id + ' created');
  } else {
    logger.info('Bot:' + id + ' already created');
  }
}

/**
 * Initialize all bot instances withing RDS to run
 */
rds.models.ApplicationPlatformEntity.findAll().then(function(results){
  results.forEach(function(instance) {
    createBot(instance);
  });
});

/**
 * Tests for the bot module
 */
var assert = require('assert');
var bot = require('@the-brain-trust/bot');
var factory = require('./lib/factory');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');
var registry = require('../bot/registry');

describe('BotButtonwood', function(){
  var applicationPlatformEntity;

  before(function(done) {
    this.timeout(3000);

    rds.sync({force: true, logging: logger.stream.write})
      .then(function() {
        return factory.create('application-platform-entity');
      })
      .then(function(instance) {
        applicationPlatformEntity = instance;
        done();
      })
      .catch(function (err) {
        logger.error(err);
        done();
      });
  });

  it('should initialize bots', function(done){
    bot.botManager.init(registry)
      .then(function(bots) {
        assert(bots);

        assert(bot.botManager.getStatus().get(applicationPlatformEntity.id));
        assert.equal(
          bot.botManager.getStatus().get(applicationPlatformEntity.id),
          bot.botManager.getStatus([applicationPlatformEntity])
            .get(applicationPlatformEntity.id)
          );
        assert(bot.botManager.getBot(applicationPlatformEntity));
        done();
      });
  });
});

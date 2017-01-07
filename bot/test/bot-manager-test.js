/**
 * Tests for the bot module
 */
var assert = require('assert');
var bot = require('../bot.js');
var factory = require('./lib/factory');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');

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
    bot.botManager.init({
        buttonwood: undefined //testing invalid bot
      }).then(function(result) {
        var bots = result[0];
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

/**
 * Tests for the bot module
 */
var assert = require('assert');
var botManager = require('../lib/bot-manager');
var factory = require('./lib/factory');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');

describe('BotButtonwood', function(){
  var applicationPlatformEntity;

  before(function(done) {
    this.timeout(3000);

    require('../rds/registry');

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
    botManager.init()
      .then(function(bots) {
        assert(bots);

        assert(botManager.getStatus().get(applicationPlatformEntity.id));
        assert.equal(
          botManager.getStatus().get(applicationPlatformEntity.id),
          botManager.getStatus([applicationPlatformEntity])
            .get(applicationPlatformEntity.id)
          );
        assert(botManager.getBot(applicationPlatformEntity));
        done();
      });
  });
});

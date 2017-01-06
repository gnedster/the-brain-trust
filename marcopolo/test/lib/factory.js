var q = require('q');
var factory = require('factory-girl').promisify(q);
var faker = require('faker');
var rds = require('@the-brain-trust/rds');
require('factory-girl-sequelize')();

factory.define('platform', rds.models.Platform, {
  name: 'slack',
  website: 'https://slack.com',
  baseSite: 'http://localhost:4000/',
  authorizePath: 'oauth/authorize',
  accessTokenPath: 'api/oauth.access'
});

factory.define('application', rds.models.Application, {
  name: 'marcopolo',
  author: faker.company.companyName(),
  description: faker.lorem.paragraphs(),
  shortDescription: faker.lorem.sentence(),
  changelog: faker.lorem.paragraphs(),
  contact: faker.internet.email()
});

factory.define('application-permission', rds.models.ApplicationPlatform, {
  application_id: factory.assoc('application', 'id'),
  platform_id: factory.assoc('platform', 'id'),
  token: faker.random.uuid(),
  clientId: faker.random.uuid()
});

factory.define('platform-entity-team', rds.models.PlatformEntity, {
  entityId: faker.random.uuid(),
  kind: 'team'
  /**
   * Adding the line below, although correct, compels sequelize to create the
   * same model twice causing a unique validation error.
   */
  //platform_id: factory.assoc('platform', 'id')
});

factory.define('platform-entity-user', rds.models.PlatformEntity, {
  entityId: faker.random.uuid(),
  kind: 'user',
  parent_id: factory.assoc('platform-entity-team', 'id')
});

factory.define('application-platform-entity',
  rds.models.ApplicationPlatformEntity, {
  application_id: factory.assoc('application', 'id'),
  platform_id: factory.assoc('platform', 'id'),
  platform_entity_id: factory.assoc('platform-entity-team', 'id'),
  credentials: {
    'ok':true,
    'access_token':'xoxp-' + faker.random.uuid(),
    'scope':'identify,incoming-webhook,bot',
    'team_name':'team name',
    'team_id':'team id',
    'incoming_webhook':{
    'channel':'#cheese',
    'configuration_url':'https://opnd.slack.com/services/1',
      'url':'https://hooks.slack.com/services/2/2/35134124312'
    },
    'bot':{
      'bot_user_id':'123',
      'bot_access_token':'xoxb-' + faker.random.uuid()
    }
  }
});

module.exports = factory;

var q = require('q');
var moment = require('moment');
var factory = require('factory-girl').promisify(q);
var faker = require('faker');
var rds = require('@the-brain-trust/rds');
require('factory-girl-sequelize')();

factory.define('application', rds.models.Application, {
  name: faker.internet.domainWord(),
  author: faker.company.companyName(),
  description: faker.lorem.paragraphs(),
  shortDescription: faker.lorem.sentence(),
  changelog: faker.lorem.paragraphs(),
  contact: faker.internet.email()
});

factory.define('platform', rds.models.Platform, {
  name: faker.internet.domainWord(),
  website: faker.internet.domainName()
});

factory.define('application-permission', rds.models.ApplicationPlatform, {
  application_id: factory.assoc('application', 'id'),
  platform_id: factory.assoc('platform', 'id'),
  token: faker.random.uuid(),
  clientId: faker.random.uuid()
});

factory.define('platform-entity-team', rds.models.PlatformEntity, {
  entity_id: faker.random.uuid(),
  kind: 'team'
  /**
   * Adding the line below, although correct, compels sequelize to create the
   * same model twice causing a unique validation error.
   */
  //platform_id: factory.assoc('platform', 'id')
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

factory.define('event', rds.models.Event, {
  teamId: 'T024BE7LD',
  channelId: 'C2147483705',
  userId: 'U2147483697',
  initiator: 'client x app',
  timestamp: moment(),
  name: 'chat:slashdot:slack:​*:*​:message',
  details: {
    text: faker.lorem.sentence()
  }
});

module.exports = factory;

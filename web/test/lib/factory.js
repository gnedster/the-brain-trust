var q = require('q');
var factory = require('factory-girl').promisify(q);
var faker = require('faker');
var rds = require('@the-brain-trust/rds');
require('factory-girl-sequelize')();

factory.define('platform', rds.models.Platform, {
  name: 'slack',
  baseSite: 'http://localhost:4000/',
  authorizePath: 'oauth/authorize',
  accessTokenPath: 'api/oauth.access'
});

factory.define('application', rds.models.Application, {
  name: 'buttonwood',
  author: faker.company.companyName(),
  description: faker.lorem.paragraphs(),
  changelog: faker.lorem.paragraphs(),
  contact: faker.internet.email()
});

factory.define('application-permission', rds.models.ApplicationPlatform, {
  credentials: {
    clientId: faker.random.uuid(),
    clientToken: faker.random.uuid()
  }
});

module.exports = factory;
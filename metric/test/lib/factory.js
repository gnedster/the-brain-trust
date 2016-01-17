var q = require('q');
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

factory.define('event', rds.models.Event, {
  teamId: 'T024BE7LD',
  channelId: 'C2147483705',
  userId: 'U2147483697',
  initiator: 'client x app',
  timestamp: '1358878749.000002',
  name: 'chat:slashdot:slack:​*:*​:message',
  details: {
    text: faker.lorem.sentence()
  }
});

module.exports = factory;

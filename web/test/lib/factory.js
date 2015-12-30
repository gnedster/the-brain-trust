var q = require('q');
var factory = require('factory-girl').promisify(q);
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
  author: 'the brain trust',
  description: 'The best finance app.',
  changelog: 'Initial release.',
  contact: 'info@mailinator.com'
});

module.exports = factory;
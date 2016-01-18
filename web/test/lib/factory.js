var q = require('q');
var factory = require('factory-girl').promisify(q);
var faker = require('faker');
var rds = require('@the-brain-trust/rds');
require('factory-girl-sequelize')();

factory.define('platform', rds.models.Platform, {
  name: 'slack',
  description: faker.lorem.sentence(),
  website: faker.internet.domainName(),
  baseSite: 'http://localhost:4000/',
  authorizePath: 'oauth/authorize',
  accessTokenPath: 'api/oauth.access'
});

factory.define('application', rds.models.Application, {
  name: 'buttonwood',
  author: faker.company.companyName(),
  description: faker.lorem.paragraphs(),
  shortDescription: faker.lorem.sentence(),
  changelog: faker.lorem.paragraphs(),
  contact: faker.internet.email(),
  public: true
});

factory.define('application-platform', rds.models.ApplicationPlatform, {
  application_id: factory.assoc('application', 'id'),
  platform_id: factory.assoc('platform', 'id'),
  scope: 'bot,commands',
  token: faker.random.uuid(),
  clientId: faker.random.uuid()
});

factory.define('user', rds.models.User, {
  email: 'admin@test.com',
  // Corresponds to 'password'
  hash: 'dc7c5e8bdfc506c2e0f61e90b05fb890e3213da409afcf5ddd4b7aeb228594b70e17d381f5d14aac21d885514ee62fdcdd83b96db19f9c8f7694bbcd5bae480f39bddd412b828399ad0c549e9d4e32d7bcfbafe1786d296496bdeb1a4ba3be2a84cfa76a75bbc291032b358adb0f20f6bdaf350058291d6c46fceeea8eedfe349d2ccfcefd64fc3d19352de50914c2c44c8b4ccdd8e1dcf089f00d9e8e9e65d9fcbe7aad01475c79046623c9872145abfae243c7b29dde5328d724dbbaae4eedbfa7237fee7b1466dee9294e059f058ff3603779814f46869c87b50e9ae024ceb4bbaa7a30227eca0b2d2ab03395788dfb89c4ec48a1657128662b6e8d633fe2f70afc12dacdd92f68421b5b0401aef9a636694281ba825b959177ac1e81d864fe013e52d57e1c652641fd91a225702e0b644af341ca980bc99a26ec5f1a8c389cb3d2b25525a59d8d154ba8fdf318d238a9dbcab7bf009caa38f8c8f0a45f5832a46c15450800a21623ed2204a89f63a330b233c7bc49a7101a19180110cd1069370d0580efa11391e797a0020c32bda6f6ed45b9be04cf7f8c676116bd27e910c832b801b39909a3682ab028a1269cea973bf98ef0ed2d11dadfa663a6b5e7c357a225a731e4dee643ad5dfea9b71768008bd552e86002068e81fb586afb58c48fa8995a30d68439b639597d76bd3dcbbc463531159f101203a584ff67f6b1',
  salt: 'e8bfacb8560b1a2c9196223adcaba9d7d280beae9f1a040b62d9fc79de64c58a'
});

factory.define('application-user', rds.models.ApplicationUser, {
  application_id: factory.assoc('application', 'id'),
  user_id: factory.assoc('user', 'id')
});

module.exports = factory;

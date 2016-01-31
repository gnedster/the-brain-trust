var logger = require('@the-brain-trust/logger');
var registry = require('./registry');
var sequelizeFixtures = require('sequelize-fixtures');

//from file
sequelizeFixtures.loadFile('./seed/*.json', registry)
  .then(function(){
    logger.info('successfully seeded data.');
  }
);

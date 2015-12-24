/**
 * Initialize the database, run migrations.
 */
var _ = require('lodash');
var logger = require('../lib/logger');
var models = require('../models/index');
var sequelize = require('../lib/sequelize');

/**
 * Update the database with relevant models
 */
sequelize.sync(_.merge({
    logging: logger.stream.write
  }))
  .then(function(){
    logger.info('db initialized.');
  })
  .catch(function(err){
    logger.error(err);
  });


module.exports = sequelize;
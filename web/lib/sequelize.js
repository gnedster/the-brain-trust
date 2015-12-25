/**
 * Provide a SQL client using sequalize. Since the object is constructed when assigned to
 * module exports, there should be only one instance of this sqlClient.
 */

var config = require('config');
var logger = require('./logger');
var rdsConfig = config.get('rds');
var Sequelize = require('sequelize');
var util = require('./util');

if (util.isProduction() === true) {
  rdsConfig.username = process.env.RDS_USERNAME;
  rdsConfig.password = process.env.RDS_PASSWORD;
}

logger.debug('starting rds connection with config:\n' +
  JSON.stringify(rdsConfig, null, 2));

var sequelize = new Sequelize(
  rdsConfig.database,
  rdsConfig.username,
  rdsConfig.password,
  rdsConfig.options
);

module.exports = sequelize;
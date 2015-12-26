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
} else if (util.isTest() === true) {
  // https://codeship.com/documentation/databases/postgresql/
  rdsConfig.username = process.env.PG_USER;
  rdsConfig.password = process.env.PG_PASSWORD;
  rdsConfig.database = 'test' + process.env.TEST_ENV_NUMBER;
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
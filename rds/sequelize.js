/**
 * Provide a SQL client using sequalize. Since the object is constructed when assigned to
 * module exports, there should be only one instance of this sqlClient.
 */
var path = require('path');
var env = process.env.NODE_ENV || 'development';

var config = require('config.json')
  (path.join(__dirname, 'config', env + '.json'));
var logger = require('@the-brain-trust/logger');
var Sequelize = require('sequelize');
var util = require('@the-brain-trust/utility');

var rdsConfig = config.rds;

if (util.isProduction() === true || util.isTest() === true) {
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

/**
 * Provide a SQL client using sequalize. Since the object is constructed when assigned to
 * module exports, there should be only one instance of this sqlClient.
 */

var util = require('./util');
var config = require('config');
var rdsConfig = config.get('rds');
var Sequelize = require('sequelize');

var username = util.isDevelopment() ? rdsConfig.username : process.env.RDS_USERNAME;
var password = util.isDevelopment() ? rdsConfig.password : process.env.RDS_PASSWORD;

var sequelize = new Sequelize(
  rdsConfig.database,
  username,
  password,
  rdsConfig.options
);

module.exports = sequelize;
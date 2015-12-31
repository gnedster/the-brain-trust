var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

/**
 * The relation between a platform and an application
 * @type {Model}
 */
var ApplicationPlatform = sequelize.define('ApplicationPlatform', {
  credentials: {
    type: Sequelize.JSON,
    allowNull : false
  }
});

module.exports = ApplicationPlatform;

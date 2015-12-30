var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

/**
 * The permissions granted by some entity for a given application and
 * platform.
 * @type {Model}
 */
var PlatformPermission = sequelize.define('PlatformPermission', {
  credentials: {
    type: Sequelize.JSON,
    allowNull : false
  }
});

module.exports = PlatformPermission;
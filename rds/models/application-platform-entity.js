var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

/**
 * The relation between a platform entity and a given application.
 * @type {Model}
 */
var ApplicationPlatformEntity = sequelize.define('ApplicationPlatformEntity', {
  credentials: {
    type: Sequelize.JSON,
    allowNull : false
  }
});

module.exports = ApplicationPlatformEntity;

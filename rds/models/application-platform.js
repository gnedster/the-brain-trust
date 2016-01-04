var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

/**
 * The relation between a platform and an application
 * @type {Model}
 */
var ApplicationPlatform = sequelize.define('ApplicationPlatform', {
  token: {
    type: Sequelize.STRING,
    allowNull: false
  },
  clientId: {
    type: Sequelize.STRING,
    field: 'client_id'
  }
});

module.exports = ApplicationPlatform;

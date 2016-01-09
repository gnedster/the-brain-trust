var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

/**
 * Create a PlatformEntity model. Single table inheritance for entities
 * representing teams, channels, and users.
 * @type {Model}
 */
var PlatformEntity = sequelize.define('PlatformEntity', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING
  },
  kind: {
    //team, channel, user
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = PlatformEntity;

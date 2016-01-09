var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

/**
 * Create a PlatformEntity model. Single table inheritance for entities
 * representing teams, channels, and users.
 * @type {Model}
 */
var PlatformEntity = sequelize.define('PlatformEntity', {
  entity_id: {
    type: Sequelize.STRING,
    allowNull: false
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

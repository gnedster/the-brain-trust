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
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isIn: [['team', 'channel', 'user']]
    }
  }
});

module.exports = PlatformEntity;

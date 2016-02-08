var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

/**
 * Create a PlatformEntity model. Single table inheritance for entities
 * representing teams, channels, and users.
 * @type {Model}
 */
var PlatformEntity = sequelize.define('PlatformEntity', {
  entityId: {
    type: Sequelize.STRING,
    allowNull: false,
    field: 'entity_id'
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
}, {
  indexes: [{
    unique: true,
    fields: ['entity_id', 'kind', 'platform_id']
  }]
});

module.exports = PlatformEntity;

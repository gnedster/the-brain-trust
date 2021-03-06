var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

/**
 * Events for analytics
 * @type {Model}
 */
var Event = sequelize.define('Event', {
  teamId: {
    type: Sequelize.STRING,
    field: 'team_id'
  },
  channelId: {
    type: Sequelize.STRING,
    field: 'channel_id'
  },
  userId: {
    type: Sequelize.STRING,
    field: 'user_id'
  },
  initiator: {
    type: Sequelize.STRING,
    allowNull: false
  },
  timestamp: {
    type: Sequelize.DATE,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  details: {
    type: Sequelize.JSON,
    allowNull: false
  }
}, {
  indexes: [{
    fields: ['team_id'],
    method: 'btree'
  }],
  timestamps: false,
  paranoid: false
});

Event.removeAttribute('id');

module.exports = Event;

var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

/**
 * Events for analytics
 * @type {Model}
 */
var Event = sequelize.define('Event', {
  teamId: {
    type: Sequelize.STRING,
    field: 'team_id',
    allowNull : false
  },
  channelId: {
    type: Sequelize.STRING,
    field: 'channel_id',
    allowNull : false
  },
  userId: {
    type: Sequelize.STRING,
    field: 'user_id',
    allowNull : false
  },
  initiator: {
    type: Sequelize.STRING,
    allowNull: false
  },
  timestamp: {
    type: Sequelize.STRING,
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
  updatedAt: false,
  paranoid: false
});

Event.removeAttribute('id');

module.exports = Event;

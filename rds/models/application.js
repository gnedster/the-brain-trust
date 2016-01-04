var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

/**
 * Registered applications. Applications will identified using an index
 * @type {Model}
 */
var Application = sequelize.define('Application', {
  name: {
    type: Sequelize.STRING,
    allowNull : false,
    unique: true
  },
  author: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  changelog: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  contact: {
    type: Sequelize.STRING,
    allowNull: false,
    isEmail: true
  },
  lastPublishedAt: {
    type: Sequelize.DATE,
    field: 'last_published_at',
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  messagesReceived: {
    type: Sequelize.BIGINT,
    field: 'messages_received',
    defaultValue: 0
  },
  messagesSent: {
    type: Sequelize.BIGINT,
    field: 'messages_sent',
    defaultValue: 0
  },
  pageViews: {
    type: Sequelize.INTEGER,
    field: 'page_views',
    defaultValue: 0
  },
  enabled: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Application;

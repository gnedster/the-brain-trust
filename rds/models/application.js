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
    allowNull: false
  },
  lastPublishedAt: {
    type: Sequelize.DATE,
    field: 'last_published_at',
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  integrations: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  interactions: {
    type: Sequelize.BIGINT,
    defaultValue: 0
  },
  pageViews: {
    type: Sequelize.INTEGER,
    field: 'page_views',
    defaultValue: 0
  }
});

module.exports = Application;
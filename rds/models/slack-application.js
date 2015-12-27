var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

/**
 * Registered Slack applications.
 * @type {Model}
 */
var SlackApplication = sequelize.define('SlackApplication', {
  name: {
    type: Sequelize.STRING,
    allowNull : false,
    unique: true
  },
  authors: {
    type: Sequelize.STRING,
  },
  consumerKey: {
    type: Sequelize.STRING,
    allowNull : false,
    unique: true,
    field: 'consumer_key'
  },
  consumerSecret: {
    type: Sequelize.STRING,
    allowNull : false,
    unique: true,
    field: 'consumer_secret'
  }
});

module.exports = SlackApplication;
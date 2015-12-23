var Sequelize = require('sequelize');
var sequelize = require('../lib/sequelize');

/**
 * Registered Slack applications.
 * @type {Model}
 */
var SlackApplication = sequelize.define('SlackApplication', {
  name: {
    type: Sequelize.STRING,
    field: 'name',
    allowNull : false
  },
  authors: {
    type: Sequelize.STRING,
    field: 'authors'
  },
  consumerKey: {
    type: Sequelize.STRING,
    field: 'consumer_key',
    allowNull : false,
    unique: true
  },
  consumerSecret: {
    type: Sequelize.STRING,
    field: 'consumer_secret',
    allowNull : false,
    unique: true
  },
  disabled: {
    type: Sequelize.BOOLEAN,
    field: 'disabled',
    defaultValue: false
  }
}, {
  freezeTableName: true
});

module.exports = SlackApplication;
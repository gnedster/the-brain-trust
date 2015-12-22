var Sequelize = require('sequelize');
var sequelize = require('../lib/sequelize');

/**
 * Registered Slack applications.
 * @type {Model}
 */
var SlackApplication = sequelize.define('SlackApplication', {
  name: {
    type: Sequelize.STRING,
    allowNull : false,
    field: 'name'
  },
  authors: {
    type: Sequelize.STRING,
    field: 'authors'
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
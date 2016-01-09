var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

/**
 * Create a SlackUser model
 * @type {Model}
 */
var SlackUser = sequelize.define('SlackUser', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING
  }
});

module.exports = SlackUser;

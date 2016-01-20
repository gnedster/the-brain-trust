var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

/**
 * Roles
 * @type {Model}
 */
var Role = sequelize.define('Role', {
  name: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  }
});

module.exports = Role;

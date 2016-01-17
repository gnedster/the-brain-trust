
var sequelize = require('../sequelize');

/**
 * The relation between a user and an application
 * @type {Model}
 */
var ApplicationUser = sequelize.define('ApplicationUser', {}, {
  indexes: [
    {
      unique: true,
      fields: ['application_id', 'user_id']
    }
  ]}
);

module.exports = ApplicationUser;

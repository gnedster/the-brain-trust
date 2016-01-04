var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

/**
 * Models users
 * @type {Model}
 */
var User = sequelize.define('User', {
  username: {
    type: Sequelize.STRING
  },
  firstName: {
    type: Sequelize.STRING,
    field: 'first_name'
  },
  lastName: {
    type: Sequelize.STRING,
    field: 'last_name'
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    isEmail: true
  },
  locked: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  lastLoginAt: {
    type: Sequelize.DATE,
    field: 'last_login_at'
  },
  failedLoginAttempts: {
    type: Sequelize.INTEGER,
    field: 'failed_login_attempts',
    defaultValue: 0
  },
  hash: {
    type: Sequelize.TEXT
  },
  salt: {
    type: Sequelize.STRING
  },
  activationKey: {
    type: Sequelize.STRING,
    allowNull: true,
    field: 'activation_key'
  },
  resetPasswordKey: {
    type: Sequelize.STRING,
    allowNull: true,
    field: 'reset_password_key'
  }
});

module.exports = User;

var passportLocalSequelize = require('passport-local-sequelize');
var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

/**
 * Models uers
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
    allowNull: false
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
    type: Sequelize.STRING
  },
  salt: {
    type: Sequelize.STRING
  }
});

passportLocalSequelize.attachToUser(User, {
  usernameField: 'username',
  hashField: 'hash',
  saltField: 'salt'
});

module.exports = User;

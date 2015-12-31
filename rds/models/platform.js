var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

/**
 * Instances of chat platforms. There is some assumption that we'll have
 * some OAuth integration.
 * @type {Model}
 */
var Platform = sequelize.define('Platform', {
  name: {
    type: Sequelize.STRING,
    allowNull : false,
    unique: true
  },
  description: {
    type: Sequelize.STRING
  },
  baseSite: {
    type: Sequelize.STRING,
    allowNull : false,
    field: 'base_site'
  },
  authorizePath: {
    type: Sequelize.STRING,
    field: 'authorize_path'
  },
  accessTokenPath: {
    type: Sequelize.STRING,
    field: 'access_token_path'
  }
});

module.exports = Platform;
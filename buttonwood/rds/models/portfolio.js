var rds = require('@the-brain-trust/rds');
var Sequelize = require('sequelize');

/**
 * The relation between a platform and an application
 * @type {Model}
 */
var Portfolio = rds.define('Portfolio', {
  symbols: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    defaultValue: [],
    allowNull: false
  },
  summary: {
    type: Sequelize.ENUM('daily', 'weekly', 'monthly'),
    defaultValue: 'daily'
  },
  firstPush: {
    type: Sequelize.BOOLEAN,
    field: 'first_push',
    defaultValue: true,
    allowNull: false
  }
});

module.exports = Portfolio;

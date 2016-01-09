var rds = require('@the-brain-trust/rds');
var Sequelize = require('sequelize');

/**
 * Saves the portfolio for a given platform entity
 * @type {Model}
 */
var Portfolio = rds.define('Portfolio', {
  symbols: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    defaultValue: [],
    allowNull: false
  }
});

module.exports = Portfolio;

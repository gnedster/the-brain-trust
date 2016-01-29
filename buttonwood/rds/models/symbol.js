var rds = require('@the-brain-trust/rds');
var Sequelize = require('sequelize');

/**
 * Available symbols
 * @type {Model}
 */
var Symbol = rds.define('Symbol', {
  ticker: {
    type: Sequelize.STRING,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  exchange: {
    type: Sequelize.STRING,
    allowNull: false
  },
  country: {
    type: Sequelize.STRING,
    allowNull: false
  },
  categoryName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  categoryNumber: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, {
  paranoid: false,
  classMethods: {
    findSymbol: function(name) {
      return rds.query(`SELECT ticker, name, similarity(name, '${name}') AS similarity
FROM symbols
WHERE name % '${name}'
ORDER BY similarity DESC, name;`, { type: Sequelize.QueryTypes.SELECT });
    }
  }
});

module.exports = Symbol;

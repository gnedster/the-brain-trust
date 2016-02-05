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
  indexes: [{
    fields: ['name'],
    using: 'gin',
    operator: 'gin_trgm_ops'
  }],
  classMethods: {
    /**
     * Find closest match given a company name. Priority is given to companies
     * listed in the United States on equal similarity. Use pg's trgrm index.
     * @param  {String}   name  Company name
     * @return {Promise}        Query result
     */
    findSymbol: function(name) {
      return rds.query(`SELECT ticker, name, similarity(name, '${name}') AS similarity
FROM symbols
WHERE name % '${name}'
ORDER BY country='USA' DESC, similarity DESC;`, { type: Sequelize.QueryTypes.SELECT });
    }
  },
  paranoid: false
});

module.exports = Symbol;

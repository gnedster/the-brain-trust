var _ = require('lodash');
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
    /**
     * Create the pg_tgrm index on the name column
     * @return {Promise} Result of index construction
     */
    createTgrmIndex: function() {
      return rds.query('CREATE EXTENSION pg_trgm').then(function() {
        return rds.query('CREATE INDEX name_trgm_idx ON symbols USING GIN (name gin_trgm_ops)');
      });
    },
    /**
     * Find closest match given a company name. Priority is given to companies
     * listed in the United States on equal similarity. Use pg's trgrm index.
     * @param  {String}   name  Company name
     * @param  {String}   xchg  Exhange name
     * @return {Promise}        Query result
     */
    findSymbol: function(name, xchg) {
      if (_.isUndefined(xchg)) {
        return rds.query(`SELECT ticker, name, similarity(name, '${name}') AS similarity
FROM symbols
WHERE name % '${name}'
ORDER BY country='USA' DESC, similarity DESC;`, { type: Sequelize.QueryTypes.SELECT });
      } else {
        return rds.query(`SELECT ticker, name, similarity(name, '${name}') AS similarity
FROM symbols
WHERE name % '${name}', exchange = '{$xchg}'
ORDER BY country='USA' DESC, similarity DESC;`, { type: Sequelize.QueryTypes.SELECT });
      //TODO ORDER is probably not needed
      }
    }
  }
});

module.exports = Symbol;

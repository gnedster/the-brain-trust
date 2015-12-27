/**
 * Initialize the database, run migrations.
 */
var models = require('./models/registry');
var sequelize = require('./sequelize');

module.exports = sequelize;
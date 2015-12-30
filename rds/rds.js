/**
 * Initialize the database, run migrations.
 */
require('./models/registry');
var sequelize = require('./sequelize');

module.exports = sequelize;

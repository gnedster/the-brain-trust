var db = require('../db/db');
var session = require('express-session');

var SequelizeStore = require('connect-session-sequelize')(session.Store);
var sequelizeStore = new SequelizeStore({ db: db });
sequelizeStore.sync();

module.exports = sequelizeStore;

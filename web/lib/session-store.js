var rds = require('@the-brain-trust/rds');
var session = require('express-session');

var SequelizeStore = require('connect-session-sequelize')(session.Store);
var sequelizeStore = new SequelizeStore({ db: rds });
sequelizeStore.sync();

module.exports = sequelizeStore;

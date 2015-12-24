/**
 * Initialize the database, run migrations.
 */
var logger = require('../lib/util').logger;
var models = require('../models/index');
var sequelize = require('../lib/sequelize');

/**
 * Encapsulate logic to control database manipulaiton.
 */
function Db() {
  this.ready = false;
  this.error = false;
}

/**
 * Initialize the database
 * @param  {Object} options See sequelize options.
 */
Db.prototype.sync = function(options) {
  var self = this;
  sequelize.sync(options)
    .then(function(){
      self.ready = true;
      logger.info('DB set up complete.');
    })
    .catch(function(err){
      logger.error(err);
    });
};

module.exports = new Db();
var Sequelize = require('sequelize');
var sequelize = require('../lib/sequelize');

var Permission = sequelize.define('Permission', {
  teamId: {
    type: Sequelize.INTEGER,
    field: 'team_id',
    allowNull : false
  },
}, {
  freezeTableName: true
});

module.exports = Permission;
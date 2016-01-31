var rds = require('@the-brain-trust/rds');
var Portfolio = require('./models/portfolio');
var Symbol = require('./models/symbol');

Portfolio.belongsTo(rds.models.PlatformEntity, {
  foreignKey: 'platform_entity_id'
});

module.exports = {
  Portfolio: Portfolio,
  Symbol: Symbol
};

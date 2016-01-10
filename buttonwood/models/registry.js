var rds = require('@the-brain-trust/rds');
var Portfolio = require('./portfolio');

Portfolio.belongsTo(rds.models.PlatformEntity, {
  foreignKey: 'platform_entity_id'
});

module.exports = {
  Portfolio: Portfolio
};

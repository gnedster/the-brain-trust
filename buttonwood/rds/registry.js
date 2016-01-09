var rds = require('@the-brain-trust/rds');
var Portfolio = require('./models/portfolio');

Portfolio.belongsTo(rds.models.SlackUser, {
  foreignKey: 'slack_user_id'
});

module.exports = {
  Portfolio: Portfolio
};

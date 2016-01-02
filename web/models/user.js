var passportLocalSequelize = require('passport-local-sequelize');
var passport = require('passport');
var rds = require('@the-brain-trust/rds');

passportLocalSequelize.attachToUser(rds.models.User, {
  usernameField: 'email'
});

// Passport specific initializers
passport.use(rds.models.User.createStrategy());

passport.serializeUser(rds.models.User.serializeUser());
passport.deserializeUser(rds.models.User.deserializeUser());

module.exports = {
  User: rds.models.User
};

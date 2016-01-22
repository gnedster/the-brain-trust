var bodyParser = require('body-parser');
var compression = require('compression');
var config = require('config');
var error = require('@the-brain-trust/error');
var express = require('express');
var favicon = require('serve-favicon');
var flash = require('connect-flash');
var httpsRedirect = require('./lib/https-redirect');
var helmet = require('helmet');
var logger = require('@the-brain-trust/logger');
var marked = require('marked');
var morgan = require('morgan');
var path = require('path');
var passport = require('passport');
var sessionStore = require('./lib/session-store');
var session = require('express-session');
var util = require('@the-brain-trust/utility');

// Routes
var index = require('./routes/index');
var applications = require('./routes/applications');
var admin = require('./routes/admin');
var redirect = require('./routes/redirect');

var app = express();

if (util.isProduction() === true) {
  app.use(compression());
  app.use(httpsRedirect);
}

app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',
  express.static(path.join(__dirname,'/bower_components')));

app.use(morgan('combined', { stream: logger.stream }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  resave: false,
  secret: util.isProduction() ? process.env.EXPRESS_SESSION_SECRET :
    config.get('express-session.secret'),
  store: sessionStore,
  saveUninitialized: true
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// add isAuthenticated to every view
app.use('*', function(req, res, next){
  res.locals.flash = {
    info: req.flash('info'),
    success: req.flash('success'),
    warning: req.flash('warning'),
    error: req.flash('error')
  };

  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user;
  res.locals.marked = marked;
  next();
});
app.use('/', index);
app.use('/applications', applications);
app.use('/admin', admin);
app.use('/redirect', redirect);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('not found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    logger.error(err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  logger.error(err);
  var errorCode = err.status || 500;
  if (errorCode === 500) {
    error.notify('web', err);
  }
  res.status(errorCode);
  res.render('error', {
    message: config.get('error.' + errorCode) || err.message,
    error: { status: err.status }
  });
});

module.exports = app;

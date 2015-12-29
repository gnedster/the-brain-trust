var bodyParser = require('body-parser');
var config = require('config');
var express = require('express');
var favicon = require('serve-favicon');
var forceSSL = require('express-force-ssl');
var logger = require('@the-brain-trust/logger');
var morgan = require('morgan');
var path = require('path');
var sessionStore = require('./lib/session-store');
var session = require('express-session');
var util = require('@the-brain-trust/utility');

// Routes
var buttonwood = require('./routes/buttonwood');
var web = require('./routes/index');

var app = express();

if (util.isProduction() === true) {
  app.use(forceSSL);

  app.set('forceSSLOptions', {
    enable301Redirects: true,
    trustXFPHeader: true, // Assuming it is behind ELB
    httpsPort: 443,
    sslRequiredMessage: 'ssl required'
  });
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',
  express.static(path.join(__dirname,'/bower_components')));

app.use('/', web);
app.use('/buttonwood', buttonwood);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
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
  var errorCode = err.status || 500;
  res.status(errorCode);
  res.render('error', {
    message: config.get('error.' + errorCode) || err.message,
    error: { status: err.status }
  });
});

module.exports = app;

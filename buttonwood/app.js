var app = express();
var bodyParser = require('body-parser');
var buttonwood = require('./routes/buttonwood');
var error = require('@the-brain-trust/error');
var express = require('express');
var index = require('./routes/index');
var logger = require('@the-brain-trust/logger');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/', index);
app.use('/buttonwood', buttonwood);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('not found');
  err.status = 404;
  next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  var errorCode = err.status || 500;
  logger.error(err);
  error.notify('buttonwood', err);
  res.status(errorCode);
  res.json({
    message: err.message,
    error: { status: err.status }
  });
});

module.exports = app;

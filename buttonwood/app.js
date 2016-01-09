var bodyParser = require('body-parser');
var express = require('express');

var app = express();
var index = require('./routes/index');
var buttonwood = require('./routes/buttonwood');

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
  res.status(errorCode);
  res.json({
    message: err.message,
    error: { status: err.status }
  });
});

module.exports = app;

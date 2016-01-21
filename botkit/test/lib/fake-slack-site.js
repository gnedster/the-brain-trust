var bodyParser = require('body-parser');
var express = require('express');
var logger = require('@the-brain-trust/logger');

//Routes
var index = require('./router/index.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use('/', index);

app.listen(3000);

app.use(function(req, res, next) {
  var err = new Error('not found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'test') {
  app.use(function(err, req, res, next) {
    logger.error(err);
    res.sendStatus(err);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  logger.error(err);
  var errorCode = err.status || 500;
  res.sendStatus(errorCode);
  //res.render('error', {
    //message: config.get('error.' + errorCode) || err.message,
  //  error: { status: err.status }
  //});
});

module.exports = app;

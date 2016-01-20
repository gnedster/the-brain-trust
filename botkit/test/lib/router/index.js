var express = require('express');
var _ = require('lodash');

var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('ok');
});

router.post('/rtm.start', function(req, res, next) {
  var token = _.has(req, 'body.token')? req.body.token : false;

  if (token === 'xoxb-valid-token') {
    res.json({
      'ok' : true ,
      'url' : 'ws://localhost:8080',
      self : {
        'name' : 'foobar'
      }
    });
  } else {
    res.json({
      'ok' : false ,
      'error' : 'invalid_auth'
    });
  }
});

module.exports = router;

var _ = require('lodash');
var buttonwood = require('../app/buttonwood');
var express = require('express');
var rdsHelper = require('../lib/rds-helper');
var rds = require('@the-brain-trust/rds');
var router = express.Router();

router.post('/commands/quote', function (req, res, next) {
  var symbols = _.get(req, 'body.text').split(' ');

  rdsHelper.getApplicationPlatform('slack', 'buttonwood')
    .then(function(instance) {
      if (instance instanceof rds.models.ApplicationPlatform.Instance) {
        var token = _.get(instance, 'commandTokens.quote');

        if (token && token === _.get(req, 'body.token')) {
          buttonwood.messageQuote(symbols)
            .then(function(message) {
              res.json(message);
            })
            .catch(function(err){
              next(err);
            });
        } else {
          next();
        }
      } else {
        next();
      }
  }).catch(function(err) {
    next(err);
  });
});

module.exports = router;

var _ = require('lodash');
var buttonwood = require('../app/buttonwood');
var express = require('express');
var metric = require('@the-brain-trust/metric');
var moment = require('moment');
var rdsHelper = require('../lib/rds-helper');
var rds = require('@the-brain-trust/rds');
var router = express.Router();

router.post('/commands/*', function(req, res, next) {
  rdsHelper.getApplicationPlatform('slack', 'buttonwood')
    .then(function(instance) {
      if (instance instanceof rds.models.ApplicationPlatform.Instance) {
        var token = _.get(instance, 'commandToken');
        if (token && token === _.get(req, 'body.token')) {
          metric.write({
            teamId: _.get(req, 'body.team_id'),
            channelId: _.get(req, 'body.channel_id'),
            userId: _.get(req, 'body.user_id'),
            initiator: 'client x user',
            timestamp: moment.now(),
            name: 'chat:buttonwood:slack:​*:*​:command',
            details: {
              command: req.path,
              text: _.get(req, 'body.text')
            }
          });

          next();
        } else {
          res.sendStatus(404);
        }
      } else {
        res.sendStatus(404);
      }
  }).catch(function(err) {
    res.sendStatus(500);
  });
});

router.post('/commands/quote', function (req, res, next) {
  var symbols = _.compact((_.get(req, 'body.text') || '').split(' '));

  if (symbols.length > 0) {
    buttonwood.messageQuote(symbols)
      .then(function(message) {
        message.response_type = 'ephemeral';
        res.json(message);
      })
      .catch(function(err){
        next(err);
      });
  } else {
    res.send('please enter a valid stock ticker symbol');
  }
});

router.post('/commands/quote_detailed', function (req, res, next) {
  var symbols = _.compact((_.get(req, 'body.text') || '').split(' '));

  if (symbols.length > 0) {
    buttonwood.messageQuote(symbols, true)
      .then(function(message) {
        message.response_type = 'ephemeral';
        res.json(message);
      })
      .catch(function(err){
        next(err);
      });
  } else {
    res.send('please enter a valid stock ticker symbol');
  }
});

module.exports = router;

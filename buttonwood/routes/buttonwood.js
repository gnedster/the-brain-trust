var _ = require('lodash');
var buttonwood = require('../app/buttonwood');
var express = require('express');
var metric = require('@the-brain-trust/metric');
var moment = require('moment');
var rdsHelper = require('../lib/rds-helper');
var rds = require('@the-brain-trust/rds');
var router = express.Router();

router.post('/commands/quote', function (req, res, next) {
  rdsHelper.getApplicationPlatform('slack', 'buttonwood')
    .then(function(instance) {
      if (instance instanceof rds.models.ApplicationPlatform.Instance) {
        var token = _.get(instance, 'commandTokens.quote');
        var symbols = _.compact((_.get(req, 'body.text') || '').split(' '));

        if (symbols.length > 0 && token && token === _.get(req, 'body.token')) {
          metric.write({
            teamId: _.get(req, 'body.team_id'),
            channelId: _.get(req, 'body.channel_id'),
            userId: _.get(req, 'body.user_id'),
            initiator: 'client x user',
            timestamp: moment.now(),
            name: 'chat:buttonwood:slack:​*:*​:command',
            details: {
              text: _.get(req, 'body.text')
            }
          });

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

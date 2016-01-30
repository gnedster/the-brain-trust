var _ = require('lodash');
var buttonwood = require('../app/buttonwood');
var express = require('express');
var metric = require('@the-brain-trust/metric');
var moment = require('moment');
var logger = require('@the-brain-trust/logger');
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
              command: _.last(req.path.split('/')),
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
    logger.error(err);
    res.sendStatus(500);
  });
});

router.post('/commands/quote*', function(req, res, next) {
  var text;
  if (_.contains(req.path, 'quote_list')) {
    next();
  } else {
    text = _.get(req, 'body.text') || '';

    if (text.length === 0) {
      res.send('Please enter a valid stock ticker symbol.');
    } else {
      buttonwood.matchSymbols(_.get(req, 'body.text') || '')
        .then(function(symbols){
          req.symbols = symbols;
          next();
        });
    }
  }
});

router.post('/commands/quote', function (req, res, next) {
  buttonwood.messageQuote(req.symbols)
    .then(function(message) {
      message.response_type = 'ephemeral';
      res.json(message);
    })
    .catch(function(err){
      next(err);
    });
});

router.post('/commands/quote_detailed', function (req, res, next) {
  buttonwood.messageQuote(req.symbols, true)
    .then(function(message) {
      message.response_type = 'ephemeral';
      res.json(message);
    })
    .catch(function(err){
      next(err);
    });
});

router.post('/commands/quote*', function(req, res, next) {
  rds.models.Platform.findOne({
      where: {
        name: 'slack'
      }
    }).then(function(platform) {
      if (platform instanceof rds.models.Platform.Instance) {
        return rds.models.PlatformEntity.findOrCreate({
          where: {
            entity_id: _.get(req, 'body.user_id'),
            platform_id: platform.id,
            kind: 'user'
          }
        });
      } else {
        return Promise.reject('platform not found');
      }
    })
    .then(function(tuple) {
      var platform_entity = tuple[0];

      return rds.models.Portfolio.findOrCreate({
        where: {
          platform_entity_id: platform_entity.id
        }
      });
    })
    .then(function(tuple) {
      req.portfolio = tuple[0];
      next();
    })
    .catch(next);
});

router.post('/commands/quote_add', function(req, res, next) {
  req.portfolio.symbols = _.uniq(req.portfolio.symbols.concat(req.symbols.valid));

  if (req.symbols.valid.length > 0) {
    req.portfolio.save()
      .then(function() {
        res.end(`Added ${req.symbols.valid} to portfolio.`);
      });
  } else {
    res.end(`${req.symbols.invalid} could not be found.`);
  }
});

router.post('/commands/quote_remove', function(req, res, next) {
  req.portfolio.symbols = _.difference(req.portfolio.symbols, req.symbols.valid);

  if (req.symbols.valid.length > 0) {
    req.portfolio.save()
      .then(function() {
        res.end(`Removed ${req.symbols.valid} from portfolio.`);
      });
  } else {
    res.end(`${req.symbols.invalid} could not be found.`);
  }
});

router.post('/commands/quote_list', function(req, res, next) {
  if (req.portfolio.symbols.length > 0) {
    buttonwood.messageQuote({valid: req.portfolio.symbols}, false)
      .then(function(message) {
        message.response_type = 'ephemeral';
        res.json(message);
      })
      .catch(function(err){
        next(err);
      });
  } else {
    res.send('You don\'t have any symbols saved. Use the command /quote_add ' +
      'to add symbols to your portfolio.');
  }
});

module.exports = router;

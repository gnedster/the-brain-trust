var _ = require('lodash');
var buttonwood = require('../app/buttonwood');
var express = require('express');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');
var router = express.Router();

function getApplicationPlatform(platformName, applicationName) {
  return Promise.all([
    rds.models.Platform.findOne({
      where: {
        name: platformName
      }
    }),
    rds.models.Application.findOne({
      where: {
        name: applicationName
      }
    })]).then(function(results) {
      var platform = results[0];
      var application = results[1];
      if (platform instanceof rds.models.Platform.Instance &&
        application instanceof rds.models.Application.Instance) {

        return rds.models.ApplicationPlatform.findOne({
          where: {
            application_id : application.id,
            platform_id: platform.id
          }
        });
      } else {
        if (_.isNull(platform)) {
          logger.warn('no platform with name', platformName);
        }

        if (_.isNull(application)) {
          logger.warn('no application with name', applicationName);
        }

        return Promise.resolve();
      }
    }).catch(function(err) {
      logger.error(err);
    });
}

router.post('/commands/quote', function (req, res, next) {
  var symbols = _.get(req, 'body.text').split(' ');

  getApplicationPlatform('slack', 'buttonwood')
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

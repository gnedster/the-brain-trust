var config = require('config');
var express = require('express');
var logger = require('../lib/logger');
var router = express.Router();
var SlackOAuth = require('../lib/slack-oauth');
var sequelize = require('../lib/sequelize');

/* GET buttonwood. */
router.get('/', function(req, res, next) {
  res.render('buttonwood/index', {state: config.get('oauth.state')});
});

/*
 * GET buttonwood/authorize.
 * Should be the OAuth redirect uri and must contain a code and state
 */
router.get('/authorize', function(req, res, next) {
  // TODO: Get rid of hardcoded state
  if ('state' in req.query && req.query.state === config.get('oauth.state')) {
    sequelize.models.SlackApplication.findOrCreate({
      where: {
        name: 'buttonwood',
        authors: 'the brain trust',
        // TODO: Find a better way to store these secrets
        consumerKey: '16573442774.17151776516',
        consumerSecret: '0a94fc830fb4db0c37144103b9587cc1'
      }
    }).then(function(task) {
      var slackApplication = task[0];
      var slackOAuthClient = new SlackOAuth(slackApplication);
      slackOAuthClient.getOAuthAccessToken(req)
        .then(function() {
          res.render('buttonwood/authorized', {
            slackApplication: slackApplication
          });
        })
        .catch(function(error) {
          var page;
          logger.error(error);

          switch(error.message) {
            case 'access_denied':
              page = 'unauthorized';
              break;
            default:
              page = 'error';
              break;
          }
          res.render('buttonwood/' + page, {
            slackApplication: slackApplication
          });
        });
    }).catch(function(error) {
      logger.error(error);
      var err = new Error(error);
      err.status = 500;
      next(err);
    });
  } else {
    var err = new Error('not found');
    err.status = 404;
    next(err);
  }
});

module.exports = router;
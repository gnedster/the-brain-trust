var _ = require('lodash');
var config = require('config');
var express = require('express');
var logger = require('../lib/logger');
var router = express.Router();
var SlackOAuth = require('../lib/slack-oauth');
var sequelize = require('../lib/sequelize');
var sessionStore = require('../lib/session-store');

const buttonwoodClientId = '16573442774.17151776516';
const buttonwoodClientSecret = '0a94fc830fb4db0c37144103b9587cc1';

/* GET buttonwood. */
router.get('/', function(req, res, next) {
  SlackOAuth.getState()
    .then(function(oAuthState) {
      req.session = _.merge(req.session, oAuthState);
      res.render('buttonwood/index', oAuthState);
    }).catch(function(err) {
      next(err);
    });
});

/*
 * GET buttonwood/authorize.
 * Should be the OAuth redirect uri and must contain a code and state
 */
router.get('/authorize', function(req, res, next) {
  if ('state' in req.query && 'code' in req.query) {
    sequelize.models.SlackApplication.findOrCreate({
      where: {
        name: 'buttonwood',
        authors: 'the brain trust',
        // TODO: Seed these values instead
        consumerKey: buttonwoodClientId,
        consumerSecret: buttonwoodClientSecret
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
var _ = require('lodash');
var express = require('express');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');
var router = express.Router();
var OAuthClient = require('../lib/oauth-client');

/* Attempt to discover the application. */
router.get('/:name*', function(req, res, next) {
  if (req.params.name) {
    rds.models.Application.findOne({
        name: req.params.name
      })
      .then(function(application){
        req.application = application;
        next();
      })
      .catch(function(){
        var err = new Error('internal error');
        err.status = 500;
        next(err);
      });
  } else {
    var err = new Error('not found');
    err.status = 404;
    next(err);
  }
});

/* GET single application. */
router.get('/:name', function(req, res, next) {
  OAuthClient.getState()
    .then(function(state) {
      // Save oAuthState to cookie session
      req.session.oAuthState = state.oAuthState

      rds.models.Platform.findAll()
        .then(function(promise) {
          var params = {
            application: req.application,
            oAuthState: state.oAuthState,
            platforms: _.indexBy(promise[0], 'name')
          }

          res.render('applications/index', params);
        })
        .catch(function(err) {
          next(err);
        });
    }).catch(function(err) {
      next(err);
    });
});

/**
 * Show the changelog
 */
router.get('/:name/changelog', function(req, res, next) {
  res.render('applications/changelog', {
    application: req.application
  });
});

/*
 * GET applications/:name/:platform_name/authorize.
 * Should be the OAuth redirect uri and must contain a code and state
 */
router.get('/:name/:platform_name/authorize', function(req, res, next) {
  if ('state' in req.query) {
    var application = req.application;

    rds.models.Platform.findOne({
        name: req.params.platform_name
      })
      .then(function(platform) {
        if (_.isUndefined(platform)) {
          var err = new Error('not found');
          err.status = 404;
          next(err);
        }
        var oAuthClient = new OAuthClient(application, platform);

        oAuthClient.getOAuthAccessToken(req)
          .then(function() {
            res.render('applications/authorized', {
              application: application
            });
          })
        .catch(function(error) {
          var page, status;
          logger.error(error);

          switch(error.message) {
            case 'access_denied':
              status = 403;
              page = 'unauthorized';
              break;
            default:
              status = 500;
              page = 'error';
              break;
          }
          res.status(status)
            .render('applications/' + page, {
              application: application
            });
        });
      })
  } else {
    var err = new Error('not found');
    err.status = 404;
    next(err);
  }
});

module.exports = router;
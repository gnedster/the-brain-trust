var _ = require('lodash');
var express = require('express');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');
var router = express.Router();
var OAuthClient = require('../lib/oauth-client');

/* Get all applications */
router.get('/', function(req, res, next) {
  if (req.isAuthenticated()) {
    rds.models.Application.findAll()
      .then(function(applications){
        res.render('applications/index', {applications: applications});
      });
  } else {
    res.redirect('/login');
  }
});

/* Attempt to discover the application. */
router.all('/:name*', function(req, res, next) {
  if (req.params.name) {
    rds.models.Application.findOne({
        name: req.params.name
      })
      .then(function(application){
        req.application = application;
        next();
      })
      .catch(next);
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
      req.session.oAuthState = state.oAuthState;

      rds.models.Platform.findAll()
        .then(function(promise) {
          var params = {
            application: req.application,
            oAuthState: state.oAuthState,
            platforms: _.indexBy(promise[0], 'name'),
            isAuthenticated: req.isAuthenticated()
          };

          res.render('applications/show', params);
        })
        .catch(next);
    }).catch(next);
});

/**
 * GET applications/:name/edit
 */
router.get('/:name/edit', function(req, res, next) {
  if (req.isAuthenticated()) {
    res.render('applications/edit', {
      application: req.application
    });
  } else {
    res.redirect('/login');
  }
});

/**
 * POST applications/:name/edit
 */
router.post('/:name/edit', function(req, res, next) {
  if (req.isAuthenticated()) {
    req.application.update(req.body)
      .then(function(promise){
        res.render('applications/edit', {
          application: this
        });
      })
      .catch(next);
  } else {
    res.redirect('/login');
  }
});

/**
 * GET applications/:name/changelog
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
        var err;
        if (_.isUndefined(platform)) {
          err = new Error('not found');
          err.status = 404;
          next(err);
        }

        try {
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
        } catch (error) {
          logger.error(error);
          error.status = 500;
          next(error);
        }
      });
  } else {
    var err = new Error('not found');
    err.status = 404;
    next(err);
  }
});

module.exports = router;

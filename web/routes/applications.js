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
    next();
  }
});

/**
 * GET applications/create
 */
router.get('/create', function(req, res, next) {
  if (req.isAuthenticated()) {
    res.render('applications/create', {
      application: rds.models.Application.build()
    });
  } else {
    next();
  }
});

/**
 * POST applications/create
 */
router.post('/create', function(req, res, next) {
  if (req.isAuthenticated()) {
    rds.models.Application.create(req.body)
      .then(function(instance){
        req.flash('success', 'application \'%s\' created!', instance.name);
        res.redirect(`/applications/${instance.name}`);
      })
      .catch(next);
  } else {
    next();
  }
});

/* Attempt to discover the application. */
router.all('/:name*', function(req, res, next) {
  if (req.params.name) {
    rds.models.Application.findOne({
        where: {
          name: req.params.name
        }
      })
      .then(function(application){
        if (application instanceof rds.models.Application.Instance &&
          (req.isAuthenticated() || application.public)) {
          res.locals.metaDescription = application.shortDescription;
          res.locals.title = application.name;
          req.application = application;
          next();
        } else {
          var err = new Error('not found');
          err.status = 404;
          next(err);
        }
      })
      .catch(next);
  } else {
    next();
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
            platforms: _.indexBy(promise[0], 'name')
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
    next();
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
    next();
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
        where: {
          name: req.params.platform_name
        }
      })
      .then(function(platform) {
        var err;
        if (platform instanceof rds.models.Platform.Instance) {
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
        } else {
          err = new Error('not found');
          err.status = 404;
          next(err);
        }
      });
  } else {
    next();
  }
});

module.exports = router;

var _ = require('lodash');
var express = require('express');
var logger = require('@the-brain-trust/logger');
var metric = require('@the-brain-trust/metric');
var moment = require('moment');
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
    rds.models.Role.findOne({
      where: {
        name: 'owner'
      }
    }).then(function(role){
      if (role instanceof rds.models.Role.Instance) {
        return rds.models.Application.create(_.assign(req.body, {
          ApplicationUsers: [{
            user_id: req.user.id,
            role_id: role.id
          }]
        }), {
          include: [rds.models.ApplicationUser]
        });
      } else {
        return Promise.reject('owner role not found.');
      }
    }).then(function(application){
      req.flash(
        'success',
        'application "%s" created!',
        application.name
        );
      res.redirect(`/applications/${application.name}`);
    }).catch(next);
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

      return rds.models.Platform.findAll()
        .then(function(promise) {
          var params = {
            application: req.application,
            oAuthState: state.oAuthState,
            platforms: _.indexBy(promise[0], 'name')
          };

          metric.write({
            initiator: 'client x user',
            timestamp: moment.now(),
            name: `web:${req.application.name}:*:page:show:view`,
            details: {}
          });

          res.render('applications/show', params);
        });
    }).catch(next);
});

/**
 * GET applications/:name/platforms
 */
router.get('/:name/platforms', function(req, res, next) {
  if (req.isAuthenticated()) {
    rds.models.Platform.findAll({
      include: [
        {
          model: rds.models.ApplicationPlatform,
          required: false,
          where: {
            application_id: req.application.id
          }
        }
      ]
    }).then(function(platforms) {
      platforms = _.map(platforms, function(platform) {
        // There should only be one
        if (!(platform.ApplicationPlatforms[0] instanceof
          rds.models.ApplicationPlatform.Instance)) {
          platform.ApplicationPlatforms[0] = rds.models.ApplicationPlatform.build({
            application_id: req.application.id
          });
        }
        return platform;
      });

      res.render('applications/platforms', {
        application: req.application,
        platforms: platforms
      });
    }).catch(function(err){
      next(err);
    });

  } else {
    next();
  }
});

/**
 * POST applications/:name/platforms/:id
 */
router.post('/:name/platforms/:id', function(req, res, next) {
  if (req.isAuthenticated()) {
    rds.models.ApplicationPlatform.findById(req.params.id, {
        where: {
          application_id: req.application.id
        },
        include: [
          {
            model: rds.models.Platform
          }
        ]
      })
      .then(function(applicationPlatform){
        if (applicationPlatform instanceof
          rds.models.ApplicationPlatform.Instance) {
          return applicationPlatform.update(req.body);
        } else {
          return Promise.reject(`applicationPlatform not found.`);
        }
      })
      .then(function(applicationPlatform) {
        req.flash('success', 'Successfully updated platform credentials.');
        res.redirect(`/applications/${req.application.name}/platforms`);
      })
      .catch(next);
  } else {
    next();
  }
});

/**
 * POST applications/:name/platforms
 */
router.post('/:name/platforms', function(req, res, next) {
  if (req.isAuthenticated()) {
    rds.models.ApplicationPlatform.create(_.merge(req.body, {
        application_id: req.application.id
      }))
      .then(function(instance){
        req.flash('success', 'Successfully created platform credentials.');
        res.redirect(`/applications/${req.application.name}/platforms`);
      })
      .catch(next);
  } else {
    next();
  }
});

/**
 * GET applications/:name/metrics
 */
router.get('/:name/metrics.:format?', function(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.params.format === 'json') {
      metric.getTimeseries()
        .then(function(timeseries){
          res.json({
            data: timeseries
          });
        }).catch(next);
    } else {
      res.render('applications/metrics', {
        application: req.application
      });
    }
  } else {
    next();
  }
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
 * POST applications/:name
 */
router.post('/:name', function(req, res, next) {
  if (req.isAuthenticated()) {
    req.application.update(req.body)
      .then(function(promise){
        req.flash('success', 'Successfully updated application.');
        res.redirect(`/applications/${req.application.name}/edit`);
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

router.get('/:name/:platform_name/*', function(req, res, next) {
  rds.models.Platform.findOne({
    where: {
      name: req.params.platform_name
    },
    include: {
      model: rds.models.ApplicationPlatform,
      required: true,
      where: {
        application_id: req.application.id
      }
    }
  }).then(function(platform) {
    if (platform instanceof rds.models.Platform.Instance) {
      req.platform = platform;
    }

    next();
  }).catch(next);
});

/*
 * GET applications/:name/:platform_name/add.
 * Should be the OAuth redirect uri and must contain a code and state
 */
router.get('/:name/:platform_name/add', function(req, res, next) {
  var applicationPlatform;
  var platform = req.platform;

  if (platform instanceof rds.models.Platform.Instance &&
    _.isString(req.query.state)) {

    applicationPlatform = req.platform.ApplicationPlatforms[0];

    metric.write({
      initiator: 'client x user',
      timestamp: moment.now(),
      name: `web:${req.application.name}:show:add_platform:button:click`,
      details: {
        platform: platform.name
      }
    });

    res.redirect(`${platform.baseSite}${platform.authorizePath}?scope=${applicationPlatform.scope}&client_id=${applicationPlatform.clientId}&state=${req.query.state}`);
  } else {
    next();
  }
});

/*
 * GET applications/:name/:platform_name/authorize.
 * Should be the OAuth redirect uri and must contain a code and state
 */
router.get('/:name/:platform_name/authorize', function(req, res, next) {
  if ('state' in req.query) {
    var application = req.application;
    var platform = req.platform;

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

          OAuthClient.getState()
            .then(function(state) {
              // Save oAuthState to cookie session
              req.session.oAuthState = state.oAuthState;

              res.status(status)
                .render('applications/' + page, {
                  application: application,
                  oAuthState: state.oAuthState
                });
            });
        });
      } catch (error) {
        logger.error(error);
        error.status = 500;
        next(error);
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

module.exports = router;

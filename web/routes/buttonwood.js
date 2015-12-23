var express = require('express');
var router = express.Router();
var SlackOAuth = require('../lib/slack-oauth');
var SlackApplication = require('../models/slack-application');

/* GET buttonwood. */
router.get('/', function(req, res, next) {
  res.render('buttonwood/index');
});

/*
 * GET buttonwood/authorize. Should be the OAuth redirect uri and must
 * contain a code.
 */
router.get('/authorize', function(req, res, next) {
  if ('code' in req.query) {
    SlackApplication.findOrCreate({
      where: {
        name: 'buttonwood',
        authors: 'the brain trust',
        // TODO: Find a better way to store these secrets
        consumerKey: '16573442774.17151776516',
        consumerSecret: '0a94fc830fb4db0c37144103b9587cc1'
      }
    }).then(function(task) {
      var slackOAuthClient = new SlackOAuth(task[0]);
      slackOAuthClient.getOAuthAccessToken(req);
    });
  } else {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
});

module.exports = router;
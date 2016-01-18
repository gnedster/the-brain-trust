var express = require('express');
var metric = require('@the-brain-trust/metric');
var moment = require('moment');
var validUrl = require('valid-url');
var router = express.Router();

/* GET /redirect. */
router.get('/', function(req, res, next) {
  if (validUrl.isUri(req.query.s)) {
    metric.write({
      initiator: 'client x user',
      timestamp: moment.now(),
      name: 'chat:*:*:link:*​:click',
      details: {
        url: req.query.s
      }
    });

    res.redirect(req.query.s);
  } else {
    next();
  }
});

module.exports = router;

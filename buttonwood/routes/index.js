var botManager = require('../lib/bot-manager');
var express = require('express');
var router = express.Router();
var util = require('@the-brain-trust/utility');

router.get('/health', function (req, res, next) {
  res.json({
    status: {
      web: 'ok',
      bots: util.mapToObject(botManager.status())
    }
  });
});

module.exports = router;


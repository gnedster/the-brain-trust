var bot = require('@the-brain-trust/bot');
var express = require('express');
var router = express.Router();
var sqsListener = require('../lib/sqs-listener');
var util = require('@the-brain-trust/utility');

router.get('/health', function (req, res, next) {
  res.json({
    status: {
      web: 'ok',
      bots: util.mapToObject(bot.botManager.getStatus()),
      listener: sqsListener.getStatus()
    }
  });
});

module.exports = router;


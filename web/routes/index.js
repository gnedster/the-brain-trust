var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/privacy-policy', function(req, res, next) {
  res.render('privacy-policy');
});

router.get('/health', function(req, res, next) {
  res.send('OK');
});

module.exports = router;

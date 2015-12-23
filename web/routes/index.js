var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET health. */
router.get('/health', function(req, res, next) {
  res.send('OK');
});

/* GET privacy policy. */
router.get('/privacy-policy', function(req, res, next) {
  res.render('privacy-policy');
});

module.exports = router;

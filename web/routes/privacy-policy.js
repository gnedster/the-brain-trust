var express = require('express');
var router = express.Router();

/* GET privacy policy */
router.get('/', function(req, res, next) {
  res.render('privacy-policy');
});

module.exports = router;

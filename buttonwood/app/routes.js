var buttonwood = require('./buttonwood');
var express = require('express');
var router = express.Router();

router.post('/quote', function (req, res, next) {
  var symbols = req.body.text.split(' ');

  buttonwood.messageQuote(symbols)
    .then(function(message) {
      res.setHeader('Content-Type', 'application/json');
      res.json(message);
    })
    .catch(function(err){
      next(err);
    });
});

module.exports = router;
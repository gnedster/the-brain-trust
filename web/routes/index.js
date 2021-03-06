var express = require('express');
var passport = require('passport');
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

/* GET login. */
router.get('/login', function(req, res, next) {
  res.render('login');
});

/* GET logout. */
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

/* POST login. */
router.post('/login', passport.authenticate('local', {
  successRedirect: '/admin',
  failureRedirect: '/login',
  failureFlash: 'invalid username or password'
}));

module.exports = router;

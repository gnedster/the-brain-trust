var express = require('express');
var rds = require('@the-brain-trust/rds');
var router = express.Router();

router.get('*', function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    var error = new Error('not found');
    error.status = 404;
    next(error);
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  Promise.all([
    rds.models.Application.count(),
    rds.models.ApplicationPlatformEntity.count(),
    rds.models.Platform.count(),
    rds.models.User.count()
    ])
    .then(function(counts) {
      res.render('admin/index', {
        applicationCount: counts[0],
        applicationPlatformEntityCount: counts[1],
        platformCount: counts[2],
        userCount: counts[3]
      });
    })
    .catch(function(err){
      var error = new Error('internal error');
      error.status = 500;
      next(error);
    });

});

module.exports = router;

var Router = require('router');

var router = Router();

router.get('/health', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    status: 'ok'
  }));
});

module.exports = router;

/**
 * Lightweight fake Slack OAuth server
 */

var http = require('http');
var url = require('url');
var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      level: 'debug',
      handleExceptions: true,
      json: false,
      prettyPrint: true,
      colorize: true
    })
  ]
});

//Lets define a port we want to listen to
const PORT=3001;

//We need a function which handles requests and send response
function handleRequest(request, response){
  var urlObj = url.parse(request.url, true);
  logger.info('recieved request for', JSON.stringify(urlObj, null, 2));

  switch(urlObj.pathname) {
    case '/api/oauth.access':
      response.writeHead(200, {'Content-Type': 'application/json'});

      responseBody = {
        ok: true,
        access_token: 'xoxp-' + Math.floor(Math.random() * 100),
        scope: 'identify,incoming-webhook,bot',
        team_name: 'team name',
        team_id: 'team id',
        incoming_webhook: {
          channel: '#cheese',
          configuration_url: 'https://opnd.slack.com/services/1',
          url: 'https://hooks.slack.com/services/2/2/35134124312'
        },
        bot: {
          bot_user_id: '123',
          bot_access_token: 'xoxb-' + Math.floor(Math.random() * 100),
        }
      };

      logger.info('responding with:' + JSON.stringify(responseBody, null, 2));

      response.end(JSON.stringify(responseBody));
      break;
    case '/oauth/authorize':
      urlObj = url.parse(request.url, true);
      response.writeHead(302, {
        'Location': 'http://localhost:3000/buttonwood/authorize?code=1&state=' +
          urlObj.query.state
      });
      response.end();
      break;
    default:
      response.writeHead(404);
      response.end('not found');
      break;
  }
}

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
  logger.info('Fake OAuth server listening on: http://localhost:%s', PORT);
});

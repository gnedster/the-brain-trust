/**
 * Lightweight fake Slack OAuth server
 */

var http = require('http');
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
  var url = request.url;
  logger.info('recieved request for', url);

  switch(url) {
    case "/api/oauth.access":
      response.writeHead(200, {"Content-Type": "application/json"});
      response.end(JSON.stringify({
        ok: true,
        access_token: 'xoxp-' + Math.floor(Math.random() * 100),
        scope: 'identify,incoming-webhook,bot',
        team_name: 'The Brain Trust',
        team_id: 'T0GGVD0NS',
        incoming_webhook: {
          channel: '#cheese',
          configuration_url: 'https://opnd.slack.com/services/1',
          url: 'https://hooks.slack.com/services/2/2/35134124312'
        },
        bot: {
          bot_user_id: '4421',
          bot_access_token: 'xoxb-' + Math.floor(Math.random() * 100),
        }
      }));
      break;
    default:
      response.status(404)
        .send('Not found');
      break;
  }
}

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
  logger.info("Fake OAuth server listening on: http://localhost:%s", PORT);
});

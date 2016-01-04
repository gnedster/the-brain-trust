/**
 * Lightweight fake Slack OAuth server
 */

var _ = require('lodash');
var http = require('http');
var logger = require('@the-brain-trust/logger');
var qs = require('querystring');
var url = require('url');


//Lets define a port we want to listen to
const PORT=4000;

//We need a function which handles requests and send response
function handleRequest(request, response){
  var urlObj = url.parse(request.url, true);
  logger.info('recieved request for', JSON.stringify(urlObj, null, 2));

  switch(urlObj.pathname) {
    case '/oauth/authorize':
      if (_.isString(urlObj.query.client_id)) {
        logger.info('authorized and redirecting...');
        response.writeHead(302, {
          'Location': 'http://localhost:3000/applications/buttonwood/slack/authorize?' +
            'code=1&state=' +
            urlObj.query.state
        });
        response.end();
      } else {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('OAuth error: invalid_client_id');
      }

      break;
    case '/api/oauth.access':
      var body = '';

      response.writeHead(200, {'Content-Type': 'application/json'});

      request.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6)
            request.connection.destroy();
      });

      request.on('end', function () {
        var post = qs.parse(body);
        var responseBody;

        logger.info(post);

        if (post['client_id'] && post['client_secret'] && post['code']) {
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
              bot_access_token: 'xoxb-' + Math.floor(Math.random() * 100)
            }
          };
        }

        logger.info('responding with:' + JSON.stringify(responseBody, null, 2));

        response.end(JSON.stringify(responseBody));
      });



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

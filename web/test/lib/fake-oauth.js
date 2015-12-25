/**
 * Fake OAuth server to send and receive requests
 *
 */

var http = require('http');

//Lets define a port we want to listen to
const PORT=3001;

//We need a function which handles requests and send response
function handleRequest(request, response){
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
}

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
  console.log("Fake OAuth server listening on: http://localhost:%s", PORT);
});

var logger = require('@the-brain-trust/logger');
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    logger.log('received: %s', message);
  });

  ws.send('something');
});

var connect = require("connect");
var serveStatic = require("serve-static");
var bodyParser = require("body-parser");
var compression = require("compression");
var html = require("html");
var http = require("http");
var url = require("url");
var botkit = require("botkit");

var port = process.env.PORT || 8080;
var app = connect();

//Singleton
var stats = {};

app.use(compression());
app.use(serveStatic(__dirname)).listen(port);
app.use(bodyParser.urlencoded());

app.use(function(req, res){

});

console.log("Server is now running on port " + port + "...");


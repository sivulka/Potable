var express = require("express");
var stylus = require("stylus");
var http = require("http");

var app = express();

app.configure(function() {
	app.set("port", process.env.PORT || 5000);
});

app.configure("development", function() {
	app.use(express.errorHandler());
});

http.createServer(app).listen(app.get("port"), function() {
	console.log("[app.js] listening...");
});
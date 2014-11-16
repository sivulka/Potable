var common = require("./common");
var http = require("http");
var async = require("async");
var request = require("request");

var concat = function(a, b) {
	var result = [];
	for(var i=0; i<a.length; i++) {
		result.push(a[i]);
	}
	for(var i=0; i<b.length; i++) {
		result.push(b[i]);
	}
	return result;
}

module.exports = function(app) {
	app.get("/api", function(req, res) {
		res.send({
			status: 1,
			message: "The API is up and running! :)"
		});
	});

	app.get("/api/calculate", function(req, res) {
		var data = {
			lat0: 41,
			lat1: 43,
			long0: -72,
			long1: -70,
			inc: 1
		};
		var urls = [];
		for(var lat=data.lat0; lat<=data.lat1; lat+=data.inc) {
			for(var long=data.long0; long<=data.long1; long+=data.inc) {
				urls.push("https://api.tripadvisor.com/api/partner/1.0/map/" + lat + "," + long + "?key=" + common.TA_Key);
			}
		}
		console.log("requesting "+urls.length+" urls");
		var results = [];
		async.each(urls, function(uri, callback) {
			request({
				uri: uri,
				method: "GET",
				timeout: 3000,
			}, function(err, res, body) {
				var obj = JSON.parse(body);
				results = concat(results, obj.data);
				console.log(results.length);
				callback();
			});
			/*http.request(url, function(result) {
				result.on("data", function(chunk) {
					results.push(chunk);
					console.log(results.length);
					callback();
				});
			});*/
		}, function(err) {
			if (err) {
				console.log("shit");
				res.send(err);
			} else {
				console.log("DONE");
				res.send(results);
			}
		});
	});

	app.get("/api/fetch", function(req, res) {
		common.sql.connect(common.sql_config, function(err) {
			if (err) {
				res.send(err);
			}

			var req = new common.sql.Request();
			req.stream = true;
			req.query("SELECT * FROM records");

			var results = [];

			req.on("row", function(row) {
				results.push(row);
			});

			req.on("done", function(result) {
				console.log("[api/api.js] done fetching results.");
				res.send(convert_json_to_csv(results));
			});
		});
	});
};

var convert_json_to_csv = function(json) {
	data = "";
	var b = true;
	for(var j in json[0]) {
		if (b) b = false;
		else {
			data += ",";
		}
		data += j;
	}
	data += "\r\n";
	for(var i=0; i<json.length; i++) {
		var obj = json[i];
		var b = true;
		for(var j in obj) {
			if (b) b = false;
			else {
				data += ",";
			}
			data += obj[j];
		}
		data += "\r\n";
	}
	return data;
};
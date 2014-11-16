var common = require("./common");
var http = require("http");
var async = require("async");
var request = require("request");
var sleep = require("sleep").sleep;

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
			lat0: req.param("lat0"),
			lat1: req.param("lat1"),
			long0: req.param("long0"),
			long1: req.param("long1"),
			inc: 0.5,
		};
		if (!(data.lat0 && data.lat1 && data.long1 && data.long2)) {
			res.send({
				status: 0,
				message: "fuck you"
			})
		}
		var urls = [];
		for(var lat=parseFloat(data.lat0); lat<=parseFloat(data.lat1); lat+=data.inc) {
			for(var long=parseFloat(data.long0); long<=parseFloat(data.long1); long+=data.inc) {
				var url = "https://api.tripadvisor.com/api/partner/1.0/map/" + lat + "," + long + "?distance=25&key=" + common.TA_Key;
				urls.push(url);
				// console.log(url);
			}
		}
		// console.log("requesting "+urls.length+" urls");
		var results = [];
		var IDs = [];
		async.each(urls, function(uri, callback) {
			request({
				uri: uri,
				method: "GET",
				timeout: 3000,
			}, function(err, res, body) {
				sleep(1000);
				console.log(body);
				var obj = JSON.parse(body);
				if (obj.data) {
					results = concat(results, obj.data);
					IDs.push(parseInt(obj.location_id));
					// console.log(results.length);
					request({
						uri: "https://api.tripadvisor.com/api/partner/1.0/location/" + obj.location_id + "/reviews?key=" + common.TA_Key,
						method: "GET",
						timeout: 3000,
					}, function(err2, res2, body2) {
						var obj2 = JSON.parse(body2);
						if (obj2.data) {
							var reviews = "";
							var delimiter = "%%#%%";
							for(var i=0; i<obj2.data.length; i++) {
								reviews += obj2.data[i].text + delimiter;
							}
							// console.log(reviews);
							callback();
							/*
							common.sql.connect(common.sql_config, function(err) {
								if (err) {
									// fuck
								} else {
									var req = new common.sql.Request();
									req.stream = true;
									req.query("INSERT INTO records (Latitude, Longitude, Quality, Review) VALUES (" + obj.latitude + ", " + obj.longitude + ", " + obj.rating + ", ############ NOT DONE)");
								}
								callback();
							});
							*/
						}
					});
				}
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
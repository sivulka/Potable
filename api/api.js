var common = require("./common");
var http = require("http");
var async = require("async");
var request = require("request");
var sleep = require("sleep").usleep;

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
			inc: 1,
		};
		console.dir(data);
		if (!(data.lat0 && data.lat1 && data.long0 && data.long1)) {
			res.send({
				status: 0,
				message: "fuck you"
			});
			return;
		} else {
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
			var count = 0;
			async.each(urls, function(uri, callback) {
				request({
					uri: uri,
					method: "GET",
					timeout: 3000,
				}, function(err, res2, body) {
					console.log(count +"/"+ urls.length);
					count++;
					sleep(100000);
					if (body) {
						var obj = JSON.parse(body);
						if (obj.data && obj.data.length != 0) {
							for(var i=0; i<obj.data.length; i++) {
								if (!(IDs.indexOf(parseInt(obj.data[i].location_id)) == -1)) {

								} else {
									IDs.push(parseInt(obj.data[i].location_id));
									results.push(obj.data[i]);
								}
							}
							console.log(IDs.length);
						}
					}
					callback();
				});
			}, function(err) {
				if (err) {
					console.log("shit");
					res.send(err);
				} else {
					async.each(results, function(result, callback) {
						request({
							uri: "https://api.tripadvisor.com/api/partner/1.0/location/" + result.location_id + "/reviews?key=" + common.TA_Key,
							method: "GET",
						}, function(err, res3, body) {
							console.log(count +"/"+ urls.length);
							if (err) {
								console.dir(err);
							}
							sleep(100000);
							if (body) {
								var obj = JSON.parse(body);
								if (obj && obj.data) {
									var reviews = "";
									for(var i=0; i<obj.data.length; i++) {
										reviews += filter(obj.data[i].text) + "%%#%%";
									}
									var insert = {
										Latitude: parseFloat(result.latitude),
										Longitude: parseFloat(result.longitude),
										Quality: result.rating ? parseInt(result.rating) : -1,
										Reviews: reviews
									}
									console.log("inserting...");
									if (insert.Quality != -1) {
										try {
											common.sql.connect(common.sql_config, function(err) {
												if (err) {
													console.dir(insert);
													console.dir(err);
													// fuck
												} else {
													var req = new common.sql.Request();
													req.stream = true;
													var query = "INSERT INTO records (ID, Latitude, Longitude, Quality, Reviews) VALUES ("+result.location_id+", "+insert.Latitude+", "+insert.Longitude+", "+insert.Quality+", '"+insert.Reviews+"')";
													req.query(query);
													console.log(query);

													var results = [];
													req.on("done", function(result) {
														console.log("DONE MOTHERFUCKER");
														callback();
													});
												}
											});
										} catch (e) {
											// fuckit
											callback();
										}
									}
								}
							}
						});
					}, function(err) {
						console.log("DONE");
						res.send("FUCKING DONE");
					});
				}
			});
		}
	});

	app.get("/api/fetch", function(req, res) {
		common.sql.connect(common.sql_config, function(err) {
			if (err) {
				res.send(err);
			} else {
				var req = new common.sql.Request();
				req.stream = true;
				req.query("SELECT * FROM records");

				var results = [];
				console.dir(err);

				req.on("row", function(row) {
					console.dir(row);
					results.push(row);
				});

				req.on("done", function(result) {
					console.log("[api/api.js] done fetching results.");
					res.setHeader('content-type', 'text/csv');
					res.send(convert_json_to_csv(results));
					/// res.send(results);
				});
			}
		});
	});

	app.get("/api/data", function(req, res) {
		var n = (req.param("number") ? pad(parseInt(req.param("number")), 5) : "00001");
		var data =  {
			"Id": "score" + n,
			"Instance": {
				"FeatureVector": {
				},
				"GlobalParameters": {
					"URL": "",
				}
			}
		};
		request({
			url: "https://ussouthcentral.services.azureml.net/workspaces/a1ab8c987af3488abd87d0f11fb1d43e/services/646b58943b5f4ced8f291cd483cfcbf7/score",
			method: "POST",
			headers: {
				"Authorization": "Bearer "+common.ML_Key,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data)
		}, function(err, resp, body) {
			if (err) {
				console.log("shit");
				console.dir(err);
			} else {
				// console.log("yey");
				if (body) {
					var obj = JSON.parse(body);
					// console.dir(obj);
					/* res.send({
						number: parseInt(n),
						data: obj
					});
					*/
					var returned = {
						lat: parseFloat(obj[1]),
						lon: parseFloat(obj[2]),
						quality: parseInt(obj[3]),
						complaints: parseInt(obj[15])
					};
					res.send([returned]);
					return;
				}
			}
		});
	});
};

var filter = function(text) {
	var result = text;
	result = result.replace("\n", "");
	result = result.replace("\r", "");
	result = result.replace("'", "");
	result = result.replace(/\W/g, " ");
	result = result.replace(/\s{2,}/g, ' ');
	return result;
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

var pad = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
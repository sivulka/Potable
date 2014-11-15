module.exports = function(app) {
	app.get("/api", function(req, res) {
		res.send({
			status: 1,
			message: "The API is up and running! :)"
		});
	});
};
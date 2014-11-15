// Counter.js
Parse.$ = jQuery;

function ifVisit()
{
    Parse.initialize("6otm8GWkQqtitHXp8YBPvNvT4zxqe1I9VuH8TJeP", "rTU7nz7QASx1QseDKB9bvgOHSFwOZRDvSVtSSddf");

    var query = new Parse.Query("Visits");
    query.get("ayeVzR6ekS", {
        success: function(object) {
            console.log(object.get("Views"));
            object.increment("Views");
            object.save();
        },

        error: function(object, error) {
            console.log("Could not fetch Parse" + error);
        }
    });
}

var Song = Parse.Object.extend("Song");

// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.define("clear", function(request, response) {
  var query = new Parse.Query("Song");
  query.find({
    success: function(results) {
		for (var i = 0; i < results.length; ++i) {
			var song = results[i];
			song.destroy({
				success: function(myObject) {
					// The object was deleted from the Parse Cloud.
				},
				error: function(myObject, error) {
					// The delete failed.
					// error is a Parse.Error with an error code and message.
				}
			});
		}
		response.success("deleted songs");
    },
    error: function() {
      response.error("failed to delete songs");
    }
  });
});

Parse.Cloud.define("find", function(request, response) {
	var numSongs = 10;

	var i = 1;

	var song = new Song();
	var songName = "song " + i;
	var artistName = "artist " + i;

	song.save({
		name: songName,
		artist: artistName
	}, {
	  success: function(song) {
	    // Execute any logic that should take place after the object is saved.
	    // alert('New object created with objectId: ' + gameScore.id);
	    response.success(song);
	  },
	  error: function(song, error) {
	    // Execute any logic that should take place if the save fails.
	    // error is a Parse.Error with an error code and message.
	    // alert('Failed to create new object, with error code: ' + error.message);
	    response.error(error.message);
	  }
	});
	
});

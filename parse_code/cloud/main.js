
// var async = require('async');

///////////////////////////////////////////////////////////////////////////
//REMOVE THIS CODE WHEN YOU DEPLOY 
var runOnParse = false;
var originalParseFunction = Parse._request;

Parse._request = function (options) {
    Parse.serverURL = "https://api.parse.com";

    if (runOnParse === false && options.route == "functions") {
        Parse.serverURL = "http://localhost:5555";
    }

    return originalParseFunction(options);
};
//END CODE
///////////////////////////////////////////////////////////////////////////

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

	var songName = "song " + i;
	var artistName = "artist " + i;

	createSongFromValues(songName, artistName, { 
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

var createSongFromValues = function( title, artist, success, error) {

	var songDictionary = {
		name: songName,
		artist: artistName
	};

	createSongFromDictionary(songDictionary, success, error);
};

var createSongFromDictionary = function(songDictionary, success, error) {

	console.log('saving...');

	var song = new Song();

	console.log('new song');

	song.save(songDictionary, {
	  success: success,
	  error: error
	});
}

// convert youtube URLs to download URLs
// save songs to Parse
// POST data: ["songYoutubeURL", "songYoutubeURL", ...]
// response data: [{song object}, {song object}, ....]
Parse.Cloud.define("convert", function(request, response) {

	// array of youtube URLS
	var youtubeURLS = request.body;

	// convert each URL
	/*async.forEach(youtubeURLS, 

		// convert current URL
		function(youtubeURL, callback) {

	    }, 

	    // completion action
	    function(err) {
	        res.json(elections);
	    }
	);*/
});

var getYoutubeURL = function(song, artist, success, error){

	// create query
	var query = song + " by " + artist;
	query = query.replace(/ /g, "+");

	// api key
	var apiKey = "AIzaSyDAS29etVluZDFpSJ1nukEEQVv1PRpaGfM";

	// combine full url
	var queryString = "part=snippet&q=" + query + "&key=" + apiKey;
	var baseURL = "https://www.googleapis.com/youtube/v3/search";
	var url = baseURL + "?" + queryString;

	// send Request
	Parse.Cloud.httpRequest({
		method: "GET",
		url: url,
		success: function( httpResponse ) {
			var json = JSON.parse(httpResponse.text);
			var firstResult = json.items[0];

			var youtubeID = firstResult.id.videoId;
			var title = firstResult.snippet.title;
			var channel = firstResult.snippet.channelTitle;
			var medThumbnail = firstResult.snippet.thumbnails.medium.url;

			success(youtubeID, title, channel, medThumbnail);
		},
		error: function( httpResponse ) {
			console.log('Youtube query request failed with response code: ' + httpResponse.status);
			console.log('Error: ' + httpResponse.error.message);
			console.log(httpResponse);

			error(httpResponse.error.message);
		}
	});

}

var convertYoutubeURLToDownload = function(youtubeURL, callback) {

	console.log('converting youtube vid: ' + youtubeURL);

	var youtubeIDParamName = "watch?v=";
	var youtubeIDIndex = youtubeURL.indexOf(youtubeIDParamName) + youtubeIDParamName.length;
	var youtubeID = youtubeURL.substring(youtubeIDIndex);

	console.log('extracted youtube ID: ' + youtubeID);

	downloadYoutubeID(youtubeID, callback);
}

var downloadYoutubeID = function(youtubeID, callback) {

	/* DOES NOT WORK, USE CASPER */
	var reqURL = "http://www.youtube-mp3.org/a/itemInfo/?video_id" + youtubeID + "&ac=www&t=grp&r=1424516943797&s=145890";

	Parse.Cloud.httpRequest({
  		method: "GET",
  		url: reqURL,
  		body: '',
  		success: function(httpResponse) {
   			console.log(httpResponse.text);

   			// REPLACE: hardcoded download url
			callback('http://www.youtube-mp3.org/get?video_id=e-ORhEE9VVg&ts_create=1424547248&r=NjguNjUuMTY5LjIw&h2=b93d6850b962bdd4f3e29253fdcaeb2c&s=30315');
  		},
  		error: function(httpResponse) {
    		console.error('Request failed with response code ' + httpResponse.status);
  		} 		
  	});

}

var test = function() {

	var song1 = {
		name: "Blank Space",
		artist: "Taylor Swift"
	};

	var song2 = {
		name: "Dosas and Mimosas",
		artist: "Cherub"
	};

	var song3 = {
		name: "Party in the USA",
		artist: "Miley Cyrus"
	};

	var song4 = {
		name: "Power",
		artist: "Kanye West"
	};

	var song5 = {
		name: "Teenage Dream",
		artist: "Katy Perry"
	};

	var songs = [song1, song2, song3, song4, song5];

	fetchSongs(songs);
};

var fetchSongs = function (songs){

	for (var i = songs.length - 1; i >= 0; i--) {
		fetchSong(songs[i]);
	};
};

var fetchSong = function(song){

	var name = song.name;
	var artist = song.artist;

	getYoutubeURL(name, artist, function(youtubeID, title, channel, thumbnail) {
		console.log('found a youtube song!');
		console.log('[' + youtubeID + '] ' + title + ', ' + channel);

		var youtubeURL = "https://www.youtube.com/watch?v=" + youtubeID;

		downloadYoutubeID(youtubeID, function (downloadURL) {

			console.log('received download url' + downloadURL);

			var songDictionary = {
				name: name,
				artist: artist,
				youtubeURL: youtubeURL,
				downloadURL: downloadURL,
				thumbnailURL: thumbnail
			};

			console.log('saving song');
			console.log(songDictionary);

			createSongFromDictionary(songDictionary, 
				function(song){

					console.log('success saving song!');
					console.log(song);

				},
				function(song, err){

					console.log('error saving song!');
					console.log(err.message);
				}
			);

		});
	}, function(errorMessage){
		console.log('failed to find youtube song');
		console.log(errorMessage);
	});

	/*var youtube1 = "https://www.youtube.com/watch?v=e-ORhEE9VVg";
	convertYoutubeToDownload(youtube1, function (downloadURL) {
		console.log(youtube1 + " --> " + downloadURL);
	});*/
}

test();

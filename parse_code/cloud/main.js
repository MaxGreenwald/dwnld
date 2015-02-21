
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

	var query = song + " by " + artist;
	query = query.replace(/ /g, "+");

	var apiKey = "AIzaSyDAS29etVluZDFpSJ1nukEEQVv1PRpaGfM";

	var params = {
			part: "snippet",
			q: query,
			key: apiKey
		};

	console.log('params: ');
	console.log(params);

	var queryString = "part=snippet&q=" + query + "&key=" + apiKey;

	console.log(queryString);

	var reqURL = "https://www.googleapis.com/youtube/v3/search";
	var req = Parse.Cloud.httpRequest({
		method: "GET",
		url: reqURL,
		params: params,
		success: function( httpResponse ) {
			console.log('youtube query success');
			console.log(httpResponse);
		},
		error: function( httpResponse ) {
			console.log('Youtube query request failed with response code: ' + httpResponse.status);
			console.log('Error: ' + httpResponse.error.message);
		}
	});

	console.log(req);
}

var convertYoutubeToDownload = function(youtubeURL, callback) {

	console.log('converting youtube vid: ' + youtubeURL);

	var youtubeIDParamName = "watch?v=";
	var youtubeIDIndex = youtubeURL.indexOf(youtubeIDParamName) + youtubeIDParamName.length;
	var youtubeID = youtubeURL.substring(youtubeIDIndex);

	console.log('extracted youtube ID: ' + youtubeID);
http://www.youtube-mp3.org/a/itemInfo/?video_id=e-ORhEE9VVg&ac=www&t=grp&r=1424539677770&s=14231
	var reqURL = "http://www.youtube-mp3.org/a/itemInfo/?video_id" + youtubeID + "&ac=www&t=grp&r=1424516943797&s=145890";

	Parse.Cloud.httpRequest({
  		method: "GET",
  		url: reqURL,
  		body: '',
  		success: function(httpResponse) {
   			console.log(httpResponse.text);
			callback(youtubeURL);
  		},
  		error: function(httpResponse) {
    		console.error('Request failed with response code ' + httpResponse.status);
  		} 		
  	});

}

var test = function() {
	var song = "Blank Space";
	var artist = "Taylor Swift";

	getYoutubeURL(song, artist, null, null);

	/*var youtube1 = "https://www.youtube.com/watch?v=e-ORhEE9VVg";
	convertYoutubeToDownload(youtube1, function (downloadURL) {
		console.log(youtube1 + " --> " + downloadURL);
	});*/
}

test();

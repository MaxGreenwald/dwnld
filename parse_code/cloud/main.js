var YOUTUBE_APIKEY = "AIzaSyDAS29etVluZDFpSJ1nukEEQVv1PRpaGfM";
var YOUTUBE_OAUTH_BEARER = "ya29.IgGH5vJePRt8R3ciiE-gMN2NWSW0my8XdCatxvwhHUyOtgCBWDFmgtcdPVQsX3ORWKI0xbmMPnx1yA";


var _ = require('cloud/node_modules/underscore/underscore.js');
var async = require('cloud/node_modules/async/lib/async.js');
var Spooky = require('cloud/node_modules/spooky/lib/spooky.js');


///////////////////////////////////////////////////////////////////////////
//REMOVE THIS CODE WHEN YOU DEPLOY
/*var runOnParse = false;
var originalParseFunction = Parse._request;

Parse._request = function (options) {
    Parse.serverURL = "https://api.parse.com";

    console.log(options);

    if (runOnParse === false && options.route == "functions") {
        Parse.serverURL = "http://localhost:5555";
    }

    return originalParseFunction(options);
};*/
//END CODE
///////////////////////////////////////////////////////////////////////////

var Song = Parse.Object.extend("Song");

// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  var spooky = new Spooky({
	        child: {
	            transport: 'http'
	        },
	        casper: {
	            logLevel: 'debug',
	            verbose: true
	        }
	    }, function (err) {
	        if (err) {
	            e = new Error('Failed to initialize SpookyJS');
	            e.details = err;
	            throw e;
	        }

	        spooky.start(
	            'http://en.wikipedia.org/wiki/Spooky_the_Tuff_Little_Ghost');
	        spooky.then(function () {
	            this.emit('hello', 'Hello, from ' + this.evaluate(function () {
					request.succes( document.title);
	            }));
	        });
	        spooky.run();
	    });

	spooky.on('error', function (e, stack) {
	    console.error(e);

	    if (stack) {
	        console.log(stack);
	    }
	});
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
/*
Parse.Cloud.define("find", function(request, response) {

	console.log("FIND");



	var body = request.body;
	var json = JSON.parse(body);
	var songs = json.songs;

	var results = [];

	// 1st para in async.each() is the array of items
	async.each(songs,
  		// 2nd param is the function that each item is passed to
  		function(song, callback){

  			// asynchronous function call
  			fetchSong(song, function(err, songDB){

  				if (err){
  					callback(err);
  				}

  				results.push(songDB);

  				// Async call is done, alert via callback
			    callback();
  			});

		},

  		// 3rd param is the function to call when everything's done
  		function(err){
   			// All tasks are done now
    		response.success(results);
 		 }
	);

});

*/

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

// calls downloadYoutubeID on each song in the current user's
// Music Downloads playlist, or calls error()


// test();

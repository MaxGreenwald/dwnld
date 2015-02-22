var casper = require('casper').create({
    verbose: true,
    logLevel: 'debug',
    pageSettings: {
        loadImages:  true,        // The WebPage instance used by Casper will
        loadPlugins: true         // use these settings
    }
})
var utils = require('utils');
var x = require('casper').selectXPath;

var urlinit = 'http://www.youtube-mp3.org';
casper.start(urlinit, function() {
    this.sendKeys('input#youtube-url', 'https://www.youtube.com/watch?v=v-SmHxgxW9w');
    this.wait(3000);


    this.evaluate(function() {
        document.getElementById('submit').removeAttribute('disabled');
    });

 casper.then(function() {
this.echo(this.getElementAttribute('input[id="submit"]', 'disabled'));


    this.click('input[id="submit"]');
    var links;

    casper.waitForSelector('.success', function() {
        
        var link = this.evaluate(function() {
            return __utils__.getElementByXPath("//a[contains(@href,'&ts_create')]").href;
        })

        casper.then(function() {
            utils.dump(link);
        });

        
    });
});

});







casper.run(function() {
    this.echo('Done.').exit();
});
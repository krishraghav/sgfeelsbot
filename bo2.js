var _           = require('lodash');
var Client      = require('node-rest-client').Client;
var Twit        = require('twit');
var async       = require('async');
var wordFilter  = require('wordfilter');

var t = new Twit({
  consumer_key:         : 'PCbyR0NnjClONgRueveNuZ7Dn',
  consumer_secret:      : 'NN63PPDbs7AA9j8Hwo9EWgNMbQvfDRRu8bbJWVXyBTZCXwB7zr',
  access_token          : '3032881008-aKDruOO1RdGtnkrYn1YHy9SWbll3sq9uiVab2OV',
  access_token_secret   : 'bYsG2iy8862ySq8wvTlBX1vTvKNQWx2Bt1Y3RpCqsI0qO'
});
var wordnikKey          = 'd68002163df7bacefb212046045066f599b26946cc1c89bf5';

run = function() {
  async.waterfall([
    getPublicTweet,
    CleanTweet,	 	 	
    postTweet
  ],
  function(err, botData) {
    if (err) {
      consola.log('There was an error posting to Twitter: ', err);
    } else {
      console.log('Tweet successful!');
      console.log('Tweet: ', botData.tweetBlock);
    }
    console.log('Base tweet: ', botData.baseTweet);
  });
}

getPublicTweet = function(cb) {
  t.get('search/tweets', {q: 'feel like', count: 1, result_type: 'recent', lang: 'en', geocode: '1.325647, 103.813137,100km}, function(err, data, response) {
    if (!err) {
      var botData = {
        baseTweet       : data.statuses[0].text.toLowerCase(),
        tweetID         : data.statuses[0].id_str,
        tweetUsername   : data.statuses[0].user.screen_name
      };
      cb(null, botData);
    } else {
      console.log("There was an error getting a public Tweet. Abandoning EVERYTHING :(");
      cb(err, botData);
    }
  });
};


CLeanTweet = function(botData, cb) {
  var excludeNonAlpha       = /[^a-zA-Z]+/;
  var excludeURLs           = /https?:\/\/[-a-zA-Z0-9@:%_\+.~#?&\/=]+/g;
  var excludeHandles        = /@[a-z0-9_-]+/g;
  var excludePatterns       = [excludeURLs, excludeHandles];
  botData.tweet             = botData.baseTweet;

  _.each(excludePatterns, function(pat) {
    botData.tweet = botData.tweet.replace(pat, ' ');
  });

  botData.tweetWordList = botData.tweet.split(excludeNonAlpha);

  cb(null, botData);
};

postTweet = function(botData, cb) {
  if (!wordFilter.blacklisted(botData.tweetBlock)) {
    t.post('statuses/update', {status: botData.tweetBlock}, function(err, data, response) {
      cb(err, botData);
    });
  }
}

setInterval(function() {
  try {
    run();
  }
  catch (e) {
    console.log(e);
  }
}, 60000* 60);

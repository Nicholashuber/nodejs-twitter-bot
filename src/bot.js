'use strict'
// Dependencies =========================  
const Twit = require('twit')
const ura = require('unique-random-array')
const config = require('./config')
const strings = require('./helpers/strings')
const sentiment = require('./helpers/sentiment')

const Twitter = new Twit({
  consumer_key: config.twitter.consumerKey,
  consumer_secret: config.twitter.consumerSecret,
  access_token: config.twitter.accessToken,
  access_token_secret: config.twitter.accessTokenSecret
})

// Frequency
const retweetFrequency = config.twitter.retweet
const favoriteFrequency = config.twitter.favorite
const imageFrequency = config.twitter.imagetweet
//  username
const username = config.twitter.username

var fs = require('fs'),
    path = require('path');

// RANDOM QUERY STRING  =========================

let qs = ura(strings.queryString)
let qsSq = ura(strings.queryStringSubQuery)
let rt = ura(strings.resultType)
let rs = ura(strings.responseString)

// https://dev.twitter.com/rest/reference/get/search/tweets 
// A UTF-8, URL-encoded search query of 500 characters maximum, including operators.
// Queries may additionally be limited by complexity.
 
// RETWEET BOT ==========================
 
// find latest tweet according the query 'q' in params

// result_type: options, mixed, recent, popular
// * mixed : Include both popular and real time results in the response. 
// * recent : return only the most recent results in the response
// * popular : return only the most popular results in the response.


var random = function (minimum, maximum) {
    return Math.round( Math.random() * (maximum - minimum) + minimum);
}

//function pick_random_cute_animal(){
  //var num = 10; 

  //var num = num + 1;
  //num++

  
  //var cute_animals = random(1,554)+'';
//  var cute_animals = num++; 
//  return cute_animals[Math.floor(Math.random() * cute_animals.length)];
//}

function pick_random_cute_animal(){
  var cute_animals = random(1,554)+'';
  return cute_animals[Math.floor(Math.random() * cute_animals.length)];
}

var imageTweet = function () {
  var paramQS = qs()
  paramQS += qsSq()
  var paramRT = rt()
  var params = {
    q: paramQS + paramBls(),
    result_type: paramRT,
    lang: 'en'
  }


////////////////function upload_random_image(){
  console.log('Opening an image...');
  var image_path = path.join(__dirname, '/files/' +'  ('+pick_random_cute_animal()+').png'),
      b64content = fs.readFileSync(image_path, { encoding: 'base64' });

  console.log('Uploading an image...');

  Twitter.post('media/upload', { media_data: b64content }, function (err, data, response) {
    if (err){
      console.log('ERROR');
      console.log(err);
    }
    else{
      console.log('Uploaded an image!');

      Twitter.post('statuses/update', {
        media_ids: new Array(data.media_id_string),
        status: 'Trying out the spaghetti and meatballs'
      },
        function(err, data, response) {
          if (err){
            console.log('Error!');
            console.log(err);
             return
          }
          else{
            console.log('Posted an image!');
             return
          }
        }
      );
    }
  });
////////////////////}
//setInterval(
  //upload_random_image(),
  //60000
//);
}
//imageTweet()itdoeswork
//setInterval(imageTweet, 90000)2min
setInterval(imageTweet, 1800000)
let retweet = function () {
  var paramQS = qs()
  paramQS += qsSq()
  var paramRT = rt()
  var params = {
    q: paramQS + paramBls(),
    result_type: paramRT,
    lang: 'en'
  }

  Twitter.get('search/tweets', params, function (err, data) {
    if (!err) { // if there no errors
      try {
        // grab ID of tweet to retweet
        // run sentiment check ==========
        var retweetId = data.statuses[0].id_str
        var retweetText = data.statuses[0].text

        // setup http call
        var httpCall = sentiment.init()

        httpCall.send('txt=' + retweetText).end(function (result) {
          //test
          var sentim = ''
          var confidence = 'parseFloat(result.body.result.confidence)'
          console.log(confidence, sentim)
          // if sentiment is Negative and the confidence is above 75%
          if (sentim === 'Negative' && confidence >= 75) {
            console.log('RETWEET NEG NEG NEG', sentim, retweetText)
            return
          }
        })
      } catch (e) {
        console.log('retweetId DERP!', e.message, 'Query String:', paramQS)
        return
      }
      
      

      
     // Twitter.post('statuses/update', {status: 'Testing the spaghetti and meatballs'},  function(error, tweet, response){
  //if(error){
  //  console.log(error);
//  }
//  console.log(tweet);  // Tweet body.
//  console.log(response);  // Raw response object.
//});
      
      
      
      
      
      
            // Tell TWITTER to retweet
      Twitter.post('statuses/retweet/:id', {
        id: retweetId
      }, function (err, response) {
        if (response) {
          console.log('RETWEETED!', ' Query String:', paramQS)
        }
                // if there was an error while tweeting
        if (err) {
          console.log('RETWEET ERROR! Duplication maybe...:', err, 'Query String:', paramQS)
        }
      })
    } else { console.log('Something went wrong while SEARCHING...') }
  })
}

// retweet on bot start
retweet()
//imageTweet()
// retweet in every x minutes
setInterval(retweet, 1000 * 60 * retweetFrequency)
//setInterval(upload_random_image(),1)


///favoriteTweet()
    // favorite in every x minutes
//setInterval(upload_random_image(),60000)
////setInterval(favoriteTweet, 1000 * 60 * favoriteFrequency)

// FAVORITE BOT====================

// find a random tweet and 'favorite' it
var favoriteTweet = function () {
  var paramQS = qs()
  paramQS += qsSq()
  var paramRT = rt()
  var params = {
    q: paramQS + paramBls(),
    result_type: paramRT,
    lang: 'en'
  }

    // find the tweet
  Twitter.get('search/tweets', params, function (err, data) {
    if (err) {
      console.log(`ERR CAN'T FIND TWEET:`, err)
    } else {
        // find tweets
      var tweet = data.statuses
      var randomTweet = ranDom(tweet) // pick a random tweet

        // if random tweet exists
      if (typeof randomTweet !== 'undefined') {
            // run sentiment check ==========
            // setup http call
        var httpCall = sentiment.init()
        var favoriteText = randomTweet['text']

        httpCall.send('txt=' + favoriteText).end(function (result) {
          var sentim = 'result.body.result.sentiment'
          var confidence = 'parseFloat(result.body.result.confidence)'
          console.log(confidence, sentim)
        // if sentiment is Negative and the confidence is above 75%
          if (sentim === 'Negative' && confidence >= 75) {
            console.log('FAVORITE NEG NEG NEG', sentim, favoriteText)
            return
          }
        })

            // Tell TWITTER to 'favorite'
        Twitter.post('favorites/create', {
          id: randomTweet.id_str
        }, function (err, response) {
                // if there was an error while 'favorite'
          if (err) {
            console.log('CANNOT BE FAVORITE... Error: ', err, ' Query String: ' + paramQS)
          } else {
            console.log('FAVORITED... Success!!!', ' Query String: ' + paramQS)
          }
        })
      }
    }
  })
}

// favorite on bot start
favoriteTweet()
    // favorite in every x minutes
//setInterval(upload_random_image(),60000)
setInterval(favoriteTweet, 1000 * 60 * favoriteFrequency)

// STREAM API for interacting with a USER =======
// set up a user stream
var stream = Twitter.stream('user')

// REPLY-FOLLOW BOT ============================

// what to do when someone follows you?
stream.on('follow', followed)

// ...trigger the callback
function followed (event) {
  console.log('Follow Event now RUNNING')
        // get USER's twitter handle (screen name)
  var screenName = event.source.screen_name

    // CREATE RANDOM RESPONSE  ============================
  var responseString = rs()
  var find = 'screenName'
  var regex = new RegExp(find, 'g')
  responseString = responseString.replace(regex, screenName)

  // function that replies back to every USER who followed for the first time
  console.log(responseString)
  tweetNow(responseString)
}

// function definition to tweet back to USER who followed
function tweetNow (tweetTxt) {
  var tweet = {
    status: tweetTxt
  }

  const screenName = tweetTxt.search(username)

  if (screenName !== -1) {
    console.log('TWEET SELF! Skipped!!')
  } else {
    Twitter.post('statuses/update', tweet, function (err, data, response) {
      if (err) {
        console.log('Cannot Reply to Follower. ERROR!: ' + err)
      } else {
        console.log('Reply to follower. SUCCESS!')
      }
    })
  }
}

// function to generate a random tweet tweet
function ranDom (arr) {
  var index = Math.floor(Math.random() * arr.length)
  return arr[index]
}

function paramBls () {
  var ret = ''
  var arr = strings.blockedStrings
  var i
  var n
  for (i = 0, n = arr.length; i < n; i++) {
    ret += ' -' + arr[i]
  }
  return ret
}


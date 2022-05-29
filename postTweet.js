const Twit = require('twit');

require('dotenv').config();

const T = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

function postTweet(tweetText) {
    T.post('statuses/update', { status: tweetText }, function (err, data, response) {
        if (!err) {
            console.log(data);
        } else {
            console.log(err);
        }
    })
}

module.exports = postTweet;
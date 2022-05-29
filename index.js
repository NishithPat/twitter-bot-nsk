require('dotenv').config();
const Twit = require('twit');
const mongoose = require("mongoose");
const User = require("./models/screenName");

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });

const postTweet = require("./postTweet");

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => {
    console.log('Connected to Database');
})

let oldFollowing = [];
let newFollowing = [];

const T = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

function getFollowers(next) {

    T.get("friends/list", { screen_name: "dkni8mare", count: "200", cursor: next }, function (err, data, response) {
        console.log(data.users.length);
        console.log(data.next_cursor_str);
        next = data.next_cursor_str;

        let arr = data.users.map(val => val.screen_name);
        newFollowing = [...newFollowing, ...arr];

        if (next !== "0") {
            getFollowers(next);
        } else {
            compareFunc();
        }
    })

}

function compareFunc() {

    let followedElements = [];
    let unfollowedElements = [];

    followedElements = newFollowing.filter((name) => !oldFollowing.includes(name));
    unfollowedElements = oldFollowing.filter((name) => !newFollowing.includes(name));

    if (followedElements.length !== 0 && oldFollowing.length !== 0) {
        postTweet("followed " + JSON.stringify(followedElements));
    } else {
        console.log("followed array not tweeted");
    }

    if (unfollowedElements.length !== 0) {
        postTweet("unfollowed " + JSON.stringify(unfollowedElements));
    } else {
        console.log("unfollowed array not tweeted");
    }

    oldFollowing.forEach((ele) => {
        User.bulkWrite([{
            deleteOne: {
                filter: { screen_name: ele }
            }
        }])
    })

    newFollowing.forEach((ele) => {
        User.bulkWrite([{
            insertOne: {
                document: {
                    screen_name: ele
                }
            }
        }])
    })

    setTimeout(() => {
        process.exit()
    }, 15000)

}

async function v1() {
    oldFollowing = (await User.find()).map(val => val.screen_name);
    newFollowing = [];
    getFollowers("-1");
}

setInterval(() => {
    v1();
}, 120000);


const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();
const { matchesByCompetition } = require('./getMatches');
const { writeTweet } = require('./writeTweet');

const userClient = new TwitterApi({
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  accessToken: process.env.ACCESS_TOKEN_KEY,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
});

// msgs: array of messages
const tweetThread = async (msgs) => {
  try {
    await userClient.v2.tweetThread(msgs);
  } catch (error) {
    console.log(error);
  }
};

const handler = async () => {
  try {
    const competitions = await matchesByCompetition();
    const tweetsPosted = [];

    Promise.all(
      Object.entries(competitions).map(async ([key, value]) => {
        if (value?.length > 0) {
          const tweets = await writeTweet(key, value);
          console.log(tweets);
          await tweetThread(tweets);
          tweetsPosted.push(tweets);
        }
      })
    );

    return tweetsPosted;
  } catch (error) {
    console.log(`Error: ${error.message}`);
    return `Error: ${error.message}`;
  }
};

module.exports = {
  handler,
};

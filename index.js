const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();
const { matchesByCompetition } = require('./getMatches');
const { writeTweet } = require('./writeTweet');

// msgs: array of messages
const tweetThread = async (msgs) => {
  const userClient = new TwitterApi({
    appKey: process.env.APP_KEY,
    appSecret: process.env.APP_SECRET,
    accessToken: process.env.ACCESS_TOKEN_KEY,
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
  });

  try {
    const { data } = await userClient.v2.tweetThread(msgs);
    return data;
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  try {
    const competitions = await matchesByCompetition();

    const tweetsPosted = Promise.all(
      Object.entries(competitions).map(async ([key, value]) => {
        if (value?.length > 0) {
          const tweets = await writeTweet(key, value);
          console.log(`Tweets`, { tweets });
          const tweet = await tweetThread(tweets);
          return tweet;
        }
        return;
      })
    );

    return tweetsPosted;
  } catch (error) {
    console.log(`Error: ${error.message}`);
    return `Error: ${error.message}`;
  }
})();

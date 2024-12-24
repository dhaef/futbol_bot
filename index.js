const { TwitterApi } = require('twitter-api-v2');
const { matchesByCompetition } = require('./getMatches');
const { writeTweet } = require('./writeTweet');
const creds = require('./creds.json');

// msgs: array of messages
const tweetThread = async (msgs) => {
  const userClient = new TwitterApi({
    appKey: creds.APP_KEY,
    appSecret: creds.APP_SECRET,
    accessToken: creds.ACCESS_TOKEN_KEY,
    accessSecret: creds.ACCESS_TOKEN_SECRET,
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
    let competitionsWithMatches = 0;

    const tweetsPosted = Promise.all(
      Object.entries(competitions).map(async ([competition, matches]) => {
        if (matches?.length > 0) {
          const tweets = await writeTweet(competition, matches);
          console.log(`Tweets`, { tweets });
          const tweet = await tweetThread(tweets);
          competitionsWithMatches++;
          return tweet;
        }
        return;
      })
    );

    if (competitionsWithMatches === 0) {
      await tweetThread(['😢 no matches today']);
    }

    return tweetsPosted;
  } catch (error) {
    console.log(`Error: ${error.message}`);
    return `Error: ${error.message}`;
  }
})();

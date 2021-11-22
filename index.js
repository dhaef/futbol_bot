const twitter = require('twitter-lite');
const fetch = require('node-fetch');
require('dotenv').config();
const client = new twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

const comps = {
  pl: [],
  laLiga: [],
  bundesliga: [],
  serieA: [],
  ligueOne: [],
  cl: [],
};

const getMatches = async () => {
  const todaysDate = new Date();
  let year = todaysDate.getFullYear();
  let month = todaysDate.getMonth();
  let day = todaysDate.getDate();
  let date = `${year}-${
    month.toString().length === 1 ? `0${month + 1}` : month + 1
  }-${day.toString().length === 1 ? `0${day}` : day}`;
  const res = await fetch(
    `https://api.football-data.org/v2/matches?competitions=2021,2014,2019,2002,2001,2015&dateFrom=${date}&dateTo=${date}&status=SCHEDULED`,
    // const res = await fetch(`https://api.football-data.org/v2/matches?competitions=2021,2014,2019,2002&dateFrom=2020-09-19&dateTo=2020-09-19&status=SCHEDULED`,
    //   const res = await fetch(
    //     `https://api.football-data.org/v2/matches?competitions=2021,2014,2019,2002,2001,2015&dateFrom=2021-11-06&dateTo=2021-11-06`,
    { headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_TOKEN } }
  );
  const data = await res.json();
  console.log(data);
  data.matches.forEach((match) => {
    // console.log(match.competition);
    if (match.competition.id === 2021) {
      comps.pl.push(match);
    } else if (match.competition.id === 2014) {
      comps.laLiga.push(match);
    } else if (match.competition.id === 2002) {
      comps.bundesliga.push(match);
    } else if (match.competition.id === 2019) {
      comps.serieA.push(match);
    } else if (match.competition.id === 2015) {
      comps.ligueOne.push(match);
    } else if (match.competition.id === 2001) {
      comps.cl.push(match);
    }
  });
  console.log(comps);
  Object.values(comps).forEach((comp) => {
    if (comp.length > 0) {
      writeTweet(comp);
    }
  });
  return comps;
};

// getMatches();

function writeTweet(matches) {
  let msg = `Today's ${getTwitterHandle(
    matches[0].competition.name
  )} matches\r\n\r\n`;
  let lastTime = '';
  matches.forEach((match) => {
    const newTime = new Date(match.utcDate);
    let matchTime = newTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    // let matchTime = newTime.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' });
    if (lastTime != matchTime) {
      msg += `\r\n⏰ ${matchTime}\r\n`;
    }
    msg += `⚽️ ${match.homeTeam.name} v ${match.awayTeam.name}\r\n`;
    lastTime = matchTime;
  });
  console.log(msg);
  if (msg.length <= 280) {
    postTweet(msg);
  } else {
    const parts = msg.split('⏰');
    if (parts.length > 2) {
      let thread = [];
      let msg = parts[0];
      let count = parts[0].length;
      parts.forEach((item, index) => {
        if (index === 0) {
          return;
        }
        if (msg.length + item.length < 280) {
          msg += `⏰ ${item}`;
          count += item.length;
        } else {
          thread.push(msg);
          msg = `⏰ ${item}`;
          count = item.length;
        }
        if (index === parts.length - 1) {
          thread.push(msg);
        }
      });
      postTweetThread(thread);
    } else {
      let thread = [];
      let msg = parts[0];
      let count = parts[0].length;
      parts[1].split('⚽️').forEach((item, index) => {
        if (msg.length + item.length < 280) {
          msg += `⚽️ ${item}`;
          count += item.length;
        } else {
          thread.push(msg);
          msg = `⚽️ ${item}`;
          count = item.length;
        }
        if (index === parts[1].split('⚽️').length - 1) {
          thread.push(msg);
        }
      });
      postTweetThread(thread);
    }
  }
}

// Single Tweet
async function postTweet(tweet) {
  try {
    await client.post('statuses/update', {
      status: tweet,
    });
  } catch (error) {
    console.log(error);
  }
}

// Tweet Thread
async function postTweetThread(tweets) {
  let lastTweetId = '';
  for (const status of tweets) {
    const tweet = await client.post('statuses/update', {
      status,
      in_reply_to_status_id: lastTweetId,
      auto_populate_reply_metadata: true,
    });
    lastTweetId = tweet.id_str;
  }
}

function getTwitterHandle(name) {
  switch (name) {
    case 'Premier League':
      return '#PremierLeague';
    case 'Primera Division':
      return '#LaLiga';
    case 'Bundesliga':
      return '#Bundesliga';
    case 'Serie A':
      return '#SerieA';
    case 'Ligue 1':
      return '#Ligue1';
    case 'UEFA Champions League':
      return '#ChampionsLeague';
    default:
      break;
  }
}

const handler = async () => {
  const res = await getMatches();
  return res;
};

module.exports = {
  handler,
};

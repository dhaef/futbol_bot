const getTwitterHandle = (name) => {
  switch (name) {
    case 'pl':
      return '#PremierLeague';
    case 'laLiga':
      return '#LaLiga';
    case 'bundesliga':
      return '#Bundesliga';
    case 'serieA':
      return '#SerieA';
    case 'ligueOne':
      return '#Ligue1';
    case 'cl':
      return '#ChampionsLeague';
    default:
      break;
  }
};

const writeTweet = async (competition, matches) => {
  const tweets = [];
  let msg = `Today's ${getTwitterHandle(competition)} matches\r\n\r\n`;
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
  if (msg.length <= 280) {
    tweets.push(msg);
  } else {
    const parts = msg.split('⏰');
    let msgPart = parts[0];
    if (parts.length > 2) {
      console.log(1);
      parts.forEach((item, index) => {
        if (index === 0) {
          return;
        }
        if (msgPart.length + item.length < 280) {
          msgPart += `⏰ ${item}`;
        } else {
          tweets.push(msgPart);
          msgPart = `⏰ ${item}`;
        }
        if (index === parts.length - 1) {
          tweets.push(msgPart);
        }
      });
    } else {
      parts[1].split('⚽️').forEach((item, index) => {
        if (msgPart.length + item.length < 280) {
          msgPart += `⚽️ ${item}`;
        } else {
          tweets.push(msgPart);
          msgPart = `⚽️ ${item}`;
        }
        if (index === parts[1].split('⚽️').length - 1) {
          tweets.push(msgPart);
        }
      });
    }
  }
  return tweets;
};

module.exports = {
  writeTweet,
};

require('dotenv').config();
const axios = require('axios');

const matchesByCompetition = async () => {
  const comps = {
    pl: [],
    laLiga: [],
    bundesliga: [],
    serieA: [],
    ligueOne: [],
    cl: [],
  };

  const todaysDate = new Date();
  const year = todaysDate.getFullYear();
  const month = todaysDate.getMonth();
  const day = todaysDate.getDate();
  const date = `${year}-${
    month.toString().length === 1 ? `0${month + 1}` : month + 1
  }-${day.toString().length === 1 ? `0${day}` : day}`;
  const { data } = await axios.get(
    `https://api.football-data.org/v2/matches?competitions=2021,2014,2019,2002,2001,2015&dateFrom=${date}&dateTo=${date}&status=SCHEDULED`,
    { headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_TOKEN } }
  );

  data.matches.forEach((match) => {
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

  return comps;
};

module.exports = {
  matchesByCompetition,
};

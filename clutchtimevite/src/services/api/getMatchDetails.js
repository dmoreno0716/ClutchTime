import axios from "axios";

export const fetchAllLeagueInfo = async (setLeagueInfo, league, season) => {
  try {
    const response = await axios.get(
      `http://localhost:3002/dashboard/allMatches/${league}/${season}`
    );
    setLeagueInfo(response.data);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

export const fetchUpcomingLeagueInfo = async (
  setUpcomingLeagueData,
  leagueShortcut
) => {
  try {
    const response = await axios.get(
      `http://localhost:3002/dashboard/nextMatch/${leagueShortcut}`
    );
    setUpcomingLeagueData(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

export const fetchAllFinishedGamesInLeagueInfo = async (
  setFinishedGamesInleagueData,
  league,
  season
) => {
  try {
    const response = await axios.get(
      `http://localhost:3002/dashboard/finishedMatches/${league}/${season}`
    );
    setFinishedGamesInleagueData(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

export const fetchScheduledGamesInLeagueInfo = async (
  setScheduledGamesInleagueData,
  league,
  season
) => {
  try {
    const response = await axios.get(
      `http://localhost:3002/dashboard/scheduledMatches/${league}/${season}`
    );
    setScheduledGamesInleagueData(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

export const fetchPinnedMatchesInfo = async (
  setPinnedMatchesData,
  league,
  season,
  userId
) => {
  try {
    const response = await axios.post(
      `http://localhost:3002/dashboard/pinnedMatches/${league}/${season}`,
      { userId }
    );
    setPinnedMatchesData(response.data);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

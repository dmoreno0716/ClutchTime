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

const API_BASE_URL = "http://localhost:3002/dashboard";

export const fetchLiveGamesInfo = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/allMatches/bl1/2024`);
    return response.data.filter((match) => !match.matchIsFinished);
  } catch (error) {
    console.error("Error fetching live games:", error);
    return [];
  }
};

export const fetchScheduledGamesInLeagueInfo = async (league, year) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/scheduledMatches/${league}/${year}`
    );
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error("Unexpected response format:", response.data);
      return [];
    }

  } catch (error) {
    console.error(`Error fetching scheduled games for ${league}:`, error);
    return [];
  }
};

export const fetchUpcomingLeagueInfo = async (league) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/nextMatch/${league}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching upcoming games for ${league}:`, error);
    return null;
  }
};

export const fetchAllFinishedGamesInLeagueInfo = async (league, year) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/finishedMatches/${league}/${year}`
    );
    return response.data.slice(0, 15); // Limit to 15 games
  } catch (error) {
    console.error(`Error fetching finished games for ${league}:`, error);
    return [];
  }
};

export const fetchPinnedMatchesInfo = async (league, year, userId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/pinnedMatches/${league}/${year}`,
      { userId }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching pinned matches for ${league}:`, error);
    return [];
  }
};

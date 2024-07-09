import axios from "axios";

export const favoriteTeam = async (teamName, currentUserId) => {
  try {
    const response = await axios.post(
      `http://localhost:3002/users/favoriteTeam`,
      {
        teamName,
        currentUserId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error following team:", error);
    throw error;
  }
};

export const unFavoriteTeam = async (teamName, currentUserId) => {
  try {
    const response = await axios.post(
      `http://localhost:3002/users/unfavoriteTeam`,
      {
        teamName,
        currentUserId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error following team:", error);
    throw error;
  }
};

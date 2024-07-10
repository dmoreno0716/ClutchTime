import axios from "axios";

export const followUser = async (userToFollowId, currentUserId) => {
  try {
    const response = await axios.post(
      `http://localhost:3002/users/followUser`,
      {
        userToFollowId,
        currentUserId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error following user:", error);
    throw error;
  }
};

export const unFollowUser = async (userToUnfollowId, currentUserId) => {
  try {
    const response = await axios.post(
      `http://localhost:3002/users/unfollowUser`,
      {
        userToUnfollowId,
        currentUserId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error following user:", error);
    throw error;
  }
};

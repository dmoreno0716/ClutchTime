import axios from "axios";

export const getUserInfo = async (userId) => {
  try {
    const response = await axios.get(
      `http://localhost:3002/users/userInfo/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

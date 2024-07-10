import axios from "axios";

export const fetchNewsInfo = async (setNewsData, newsSource) => {
  try {
    const response = await axios.get(
      `http://localhost:3002/news/source/${newsSource}`
    );
    setNewsData(response.data);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching news info", error);
    throw error;
  }
};

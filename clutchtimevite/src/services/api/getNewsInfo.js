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

export const fetchLaLigaNews = async (setNewsData) => {
  try {
    const response = await axios.get(
      `http://localhost:3002/news/fourfourtwo/laliga`
    );
    console.log("La Liga news data: ", response.data);
    return response.data.map((item) => ({
      ...item,
      likes: [],
      comments: [],
    }));
  } catch (error) {
    console.error("Error fetching La Liga news info", error);
    throw error;
  }
};

export const fetchEPLNews = async (setNewsData) => {
  try {
    const response = await axios.get(
      `http://localhost:3002/news/fourfourtwo/epl`
    );
    console.log("EPL news data: ", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching EPL news info", error);
    throw error;
  }
};

export const fetchBundesligaNews = async (setNewsData) => {
  try {
    const response = await axios.get(
      `http://localhost:3002/news/fourfourtwo/bundesliga`
    );
    console.log("Bundesliga news data: ", response.data);
    return response.data.map((item) => ({
      ...item,
      likes: [],
      comments: [],
    }));
  } catch (error) {
    console.error("Error fetching Bundesliga news info", error);
    throw error;
  }
};

export const fetchUCLNews = async (setNewsData) => {
  try {
    const response = await axios.get(
      `http://localhost:3002/news/fourfourtwo/ucl`
    );
    console.log("UCL news data: ", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching UCL news info", error);
    throw error;
  }
};


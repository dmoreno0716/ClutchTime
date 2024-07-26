const { default: axios } = require("axios");
const express = require("express");
const router = express.Router();
const natural = require("natural");
const TfIdf = natural.TfIdf;

const fetchWithRetry = async (url, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await axios.get(url, { timeout: 10000 });
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
};

const fetchAllNews = async () => {
  const sources = [
    "onefootball",
    "espn",
    "90mins",
    "goal",
    "fourfourtwo/laliga",
    "fourfourtwo/epl",
    "fourfourtwo/bundesliga",
    "fourfourtwo/ucl",
  ];

  let allNews = [];
  for (let source of sources) {
    try {
      const response = await fetchWithRetry(
        `https://footballnewsapi.netlify.app/.netlify/functions/api/news/${source}`
      );
      const newsWithMetadata = response.data.map((item, index) => ({
        ...item,
        id: `${source}_${index}`,
        timestamp: item.publishedAt || new Date().toISOString(),
        source: source,
      }));
      allNews = allNews.concat(newsWithMetadata);
    } catch (error) {
      console.error(`Error fetching news from ${source}:`, error);
      continue;
    }
  }
  return allNews;
};

router.get("/", (req, res) => {
  res.send("NEWS API IS RUNNING");
});

router.get("/all", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const allNews = await fetchAllNews();
    res.json(allNews.slice(0, limit));
  } catch (error) {
    console.error("Error fetching all news:", error);
    res.status(500).json({ error: "Unable to fetch all news" });
  }
});

router.post("/recommended", async (req, res) => {
  const { keywords, userId } = req.body;
  if (!keywords || !Array.isArray(keywords)) {
    return res.status(400).json({ error: "Invalid or missing keywords" });
  }
  try {
    const allNews = await fetchAllNews();
    const rankedNews = rankNewsByKeywords(allNews, keywords);
    res.json(rankedNews.slice(0, 10)); // Return top 10 articles
  } catch (error) {
    console.error("Error fetching recommended news:", error);
    res.status(500).json({ error: "Unable to fetch recommended news" });
  }
});

const rankNewsByKeywords = (news, keywords) => {
  const tfidf = new TfIdf();

  // Add all news articles to TfIdf
  news.forEach((article, index) => {
    tfidf.addDocument(`${article.title} ${article.description}`);
  });

  // Calculate scores for each article based on keywords
  const scores = news.map((article, index) => {
    let score = 0;
    keywords.forEach((keyword) => {
      score += tfidf.tfidf(keyword, index);
    });
    return { ...article, score };
  });

  // Sort articles by score in descending order
  return scores.sort((a, b) => b.score - a.score);
};

router.get("/preprocess", async (req, res) => {
  try {
    //gets news from all the sources
    const sources = [
      "onefootball",
      "espn",
      "90mins",
      "goal",
      "fourfourtwo/laliga",
      "fourfourtwo/epl",
      "fourfourtwo/bundesliga",
      "fourfourtwo/ucl",
    ];
    let allNews = [];

    for (let source of sources) {
      const response = await axios.get(
        `https://footballnewsapi.netlify.app/.netlify/functions/api/news/${source}`
      );
      allNews = allNews.concat(response.data);
    }

    //Calculates TF-IDF (term frequency-inverse document frequency)
    const tfidf = new TfIdf();

    allNews.forEach((article, index) => {
      tfidf.addDocument(`${article.title} ${article.description}`);
    });

    //Creates dictionary for word weight
    let wordWeights = {};

    allNews.forEach((article, index) => {
      tfidf.listTerms(index).forEach((item) => {
        if (!wordWeights[item.term] || wordWeights[item.term] < item.tfidf) {
          wordWeights[item.term] = item.tfidf;
        }
      });
    });

    //Stores wordWeights into database
    res.send({
      message: "Preprocessing complete",
      wordCount: Object.keys(wordWeights).length,
    });
  } catch (error) {
    console.error("Error preprocessing news: ", error);
    res.status(500).send("Error preprocessing news");
  }
});

router.get("/source/:source", async (req, res) => {
  const { source } = req.params;
  const response = await axios.get(
    `https://footballnewsapi.netlify.app/.netlify/functions/api/news/${source}`
  );
  res.send(response.data);
});

router.get("/fourfourtwo/laliga", async (req, res) => {
  try {
    const response = await axios.get(
      `https://footballnewsapi.netlify.app/.netlify/functions/api/news/fourfourtwo/laliga`
    );
    res.send(response.data);
  } catch (error) {
    console.error("Error fetching LaLiga news: ", error);
    res.status(500).send("Error fetching LaLiga news");
  }
});

router.get("/fourfourtwo/epl", async (req, res) => {
  try {
    const response = await axios.get(
      `https://footballnewsapi.netlify.app/.netlify/functions/api/news/fourfourtwo/epl`
    );
    res.send(response.data);
  } catch (error) {
    console.error("Error fetching EPL news: ", error);
    res.status(500).send("Error fetching EPL news");
  }
});

router.get("/fourfourtwo/bundesliga", async (req, res) => {
  try {
    const response = await axios.get(
      `https://footballnewsapi.netlify.app/.netlify/functions/api/news/fourfourtwo/bundesliga`
    );
    res.send(response.data);
  } catch (error) {
    console.error("Error fetching Bundesliga news: ", error);
    res.status(500).send("Error fetching Bundesliga news");
  }
});

router.get("/fourfourtwo/ucl", async (req, res) => {
  try {
    const response = await axios.get(
      `https://footballnewsapi.netlify.app/.netlify/functions/api/news/fourfourtwo/ucl`
    );
    res.send(response.data);
  } catch (error) {
    console.error("Error fetching UCL news: ", error);
    res.status(500).send("Error fetching UCL news");
  }
});

module.exports = router;

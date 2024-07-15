const { default: axios } = require("axios");
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("NEWS API IS RUNNING");
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

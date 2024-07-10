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

module.exports = router;

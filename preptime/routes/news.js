const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("NEWS API IS RUNNING");
});

router.get("/latest", (req, res) => {
  res.send("Latest news - random word: bicycle");
});

module.exports = router;

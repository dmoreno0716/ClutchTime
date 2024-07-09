const express = require("express");
const router = express.Router();
const axios = require("axios");
const admin = require("firebase-admin");

router.get("/", (req, res) => {
  res.send("DASHBOARD API IS RUNNING");
});

router.get("/allMatches/:league/:season", async (req, res) => {
  const { league, season } = req.params;

  if (!league || !season) {
    return res
      .status(400)
      .json({ error: "Both league and season are required" });
  }

  try {
    const response = await axios.get(
      `https://api.openligadb.de/getmatchdata/${league}/${season}`
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      `Error fetching matches for ${league} ${season}:`,
      error.message
    );
    res
      .status(500)
      .json({ error: `Unable to fetch match data for ${league} ${season}` });
  }
});

router.get("/nextMatch/:leagueShortcut", async (req, res) => {
  const { leagueShortcut } = req.params;

  if (!leagueShortcut) {
    return res.status(400).json({ error: "League shortcut is required" });
  }

  try {
    const response = await axios.get(
      `https://api.openligadb.de/getnextmatchbyleagueshortcut/${leagueShortcut}`
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      `Error fetching next match for ${leagueShortcut}:`,
      error.message
    );
    res
      .status(500)
      .json({ error: `Unable to fetch next match data for ${leagueShortcut}` });
  }
});

router.get("/finishedMatches/:league/:season", async (req, res) => {
  const { league, season } = req.params;

  if (!league || !season) {
    return res
      .status(400)
      .json({ error: "Both league and season are required" });
  }

  try {
    const response = await axios.get(
      `https://api.openligadb.de/getmatchdata/${league}/${season}`
    );
    const allMatches = response.data;
    const finishedMatches = allMatches.filter((match) => match.matchIsFinished);
    res.json(finishedMatches);
  } catch (error) {
    console.error(
      `Error fetching finished matches for ${league} ${season}:`,
      error.message
    );
    res.status(500).json({
      error: `Unable to fetch finished match data for ${league} ${season}`,
    });
  }
});

router.get("/scheduledMatches/:league/:season", async (req, res) => {
  const { league, season } = req.params;

  if (!league || !season) {
    return res
      .status(400)
      .json({ error: "Both league and season are required" });
  }

  try {
    const response = await axios.get(
      `https://api.openligadb.de/getmatchdata/${league}/${season}`
    );
    const allMatches = response.data;
    const scheduledMatches = allMatches.filter(
      (match) => !match.matchIsFinished
    );
    res.json(scheduledMatches);
  } catch (error) {
    console.error(
      `Error fetching scheduled matches for ${league} ${season}:`,
      error.message
    );
    res.status(500).json({
      error: `Unable to fetch scheduled match data for ${league} ${season}`,
    });
  }
});

async function getUserFavoriteTeams(userId) {
  try {
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();
    if (!userDoc.exists) {
      throw new Error("User not found");
    }
    console.log(userDoc.data().favoriteTeams);
    return userDoc.data().favoriteTeams || [];
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

router.post("/pinnedMatches/:league/:season", async (req, res) => {
  const { league, season } = req.params;
  const { userId } = req.body;

  if (!league || !season || !userId) {
    return res
      .status(400)
      .json({ error: "League, season, and userId are required" });
  }

  try {
    // Step 1: Fetch user's favorite teams
    const favoriteTeams = await getUserFavoriteTeams(userId);

    if (favoriteTeams.length === 0) {
      return res.json({ message: "User has no favorite teams", matches: [] });
    }

    // Step 2: Fetch all matches for the given league and season
    const matchesResponse = await axios.get(
      `https://api.openligadb.de/getmatchdata/${league}/${season}`
    );
    const allMatches = matchesResponse.data;

    // Step 3: Filter matches that include user's favorite teams
    const pinnedMatches = allMatches.filter(
      (match) =>
        favoriteTeams.includes(match.team1.teamName) ||
        favoriteTeams.includes(match.team2.teamName)
    );

    res.json(pinnedMatches);
  } catch (error) {
    console.error(
      `Error fetching pinned matches for user ${userId}, league ${league}, season ${season}:`,
      error.message
    );
    if (error.message === "User not found") {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: "Unable to fetch pinned matches" });
    }
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const axios = require("axios");
const admin = require("firebase-admin");

router.get("/", (req, res) => {
  res.send("DASHBOARD API IS RUNNING");
});

router.get("/teamStats/:leagueId/:teamId", async (req, res) => {
  const { leagueId, teamId } = req.params;

  if (!leagueId || !teamId) {
    return res
      .status(400)
      .json({ error: "League ID and Team ID are required" });
  }

  try {
    // Fetch the matches for the league
    const response = await axios.get(
      `https://api.openligadb.de/getmatchdata/${leagueId}/2024`
    );

    if (!Array.isArray(response.data)) {
      throw new Error("Unexpected response format from OpenLigaDB API");
    }

    const allMatches = response.data;
    const teamMatches = allMatches
      .filter(
        (match) =>
          (match.team1.teamId === parseInt(teamId) ||
            match.team2.teamId === parseInt(teamId)) &&
          match.matchIsFinished
      )
      .slice(-10);

    // Calculate goals scored and conceded
    let goalsScored = 0;
    let goalsConceded = 0;
    teamMatches.forEach((match) => {
      if (match.team1.teamId === parseInt(teamId)) {
        goalsScored += parseInt(match.matchResults[0]?.pointsTeam1 || 0);
        goalsConceded += parseInt(match.matchResults[0]?.pointsTeam2 || 0);
      } else {
        goalsScored += parseInt(match.matchResults[0]?.pointsTeam2 || 0);
        goalsConceded += parseInt(match.matchResults[0]?.pointsTeam1 || 0);
      }
    });

    res.json({ goalsScored, goalsConceded, matchesPlayed: teamMatches.length });
  } catch (error) {
    console.error(
      `Error fetching team stats for ${teamId} in league ${leagueId}:`,
      error.message
    );
    res.status(500).json({
      error: `Unable to fetch team stats for ${teamId} in league ${leagueId}: ${error.message}`,
    });
  }
});
router.get("matchesbyteam/:team/:weeksPast/:weeksFuture", async (req, res) => {
  const { team, weeksPast, weeksFuture } = req.params;

  if (!team || !weeksPast || !weeksFuture) {
    return res
      .status(400)
      .json({ error: "Team, past weeks and future weeks are required" });
  }

  try {
    const response = await axios.get(
      `https://api.openligadb.de/getmatchesbyteam/${team}/${weeksPast}/${weeksFuture}`
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      `Error fetching matches for ${team} ${weeksPast} ${weeksFuture}:`,
      error.message
    );
    res.status(500).json({
      error: `Unable to fetch match data for ${team} ${weeksPast} ${weeksFuture}`,
    });
  }
});

router.get("availableteams/:league/:season", async (req, res) => {
  const { league, season } = req.params;

  if (!league || !season) {
    return res
      .status(400)
      .json({ error: "Both league and season are required" });
  }

  try {
    const response = await axios.get(
      `https://api.openligadb.de/getavailableteams/${league}/${season}`
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      `Error fetching teams for ${league} ${season}:`,
      error.message
    );
    res
      .status(500)
      .json({ error: `Unable to fetch team data for ${league} ${season}` });
  }
});

router.get("/lastmatchbyleagueteam/:league/:team", async (req, res) => {
  const { league, team } = req.params;

  if (!league || !team) {
    return res.status(400).json({ error: "Both league and team are required" });
  }

  try {
    const response = await axios.get(
      `https://api.openligadb.de/getlastmatchbyleagueteam${league}/${team}`
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      `Error fetching last matches for ${league} ${team}:`,
      error.message
    );
    res
      .status(500)
      .json({ error: `Unable to fetch last match data for ${league} ${team}` });
  }
});

//previous 10 matches
router.get("/lastTenMatches/:leagueId/:teamId", async (req, res) => {
  const { leagueId, teamId } = req.params;

  if (!leagueId || !teamId) {
    return res
      .status(400)
      .json({ error: "League ID and Team ID are required" });
  }

  try {
    const currentYear = new Date().getFullYear();
    const response = await axios.get(
      `https://api.openligadb.de/getmatchdata/${leagueId}/2023`
    );

    if (!Array.isArray(response.data)) {
      throw new Error("Unexpected response format from OpenLigaDB API");
    }

    const allMatches = response.data;
    const teamMatches = allMatches
      .filter(
        (match) =>
          (match.team1.teamId === parseInt(teamId) ||
            match.team2.teamId === parseInt(teamId)) &&
          match.matchIsFinished
      )
      .slice(-10);

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;
    let points = 0;

    teamMatches.forEach((match) => {
      const isTeam1 = match.team1.teamId === parseInt(teamId);
      const team1Goals = parseInt(match.matchResults[0]?.pointsTeam1 || 0);
      const team2Goals = parseInt(match.matchResults[0]?.pointsTeam2 || 0);

      if (isTeam1) {
        goalsScored += team1Goals;
        goalsConceded += team2Goals;
        if (team1Goals > team2Goals) {
          wins++;
          points += 3;
        } else if (team1Goals === team2Goals) {
          draws++;
          points += 1;
        } else {
          losses++;
        }
      } else {
        goalsScored += team2Goals;
        goalsConceded += team1Goals;
        if (team2Goals > team1Goals) {
          wins++;
          points += 3;
        } else if (team1Goals === team2Goals) {
          draws++;
          points += 1;
        } else {
          losses++;
        }
      }
    });

    res.json({
      wins,
      draws,
      losses,
      goalsScored,
      goalsConceded,
      points,
      matchesPlayed: teamMatches.length,
    });
  } catch (error) {
    console.error(
      `Error fetching last 10 matches for ${teamId} in league ${leagueId}:`,
      error.message
    );
    res.status(500).json({
      error: `Unable to fetch last 10 matches for ${teamId} in league ${leagueId}: ${error.message}`,
    });
  }
});

//next matches
router.get("/nextmatchbyleagueteam/:league/:team", async (req, res) => {
  const { league, team } = req.params;

  if (!league || !team) {
    return res.status(400).json({ error: "Both league and team are required" });
  }

  try {
    const response = await axios.get(
      `https://api.openligadb.de/getnextmatchbyleagueteam/${league}/${team}`
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      `Error fetching next matches for ${league} ${team}:`,
      error.message
    );
    res
      .status(500)
      .json({ error: `Unable to fetch next match data for ${league} ${team}` });
  }
});

//next matches by league (for predictions drop down)
router.get("/nextmatchbyleagueshortcut/:league", async (req, res) => {
  const { league } = req.params;

  if (!league) {
    return res.status(400).json({ error: "League is required" });
  }

  try {
    const response = await axios.get(
      `https://api.openligadb.de/getnextmatchbyleagueshortcut/${league}`
    );
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching next matches for ${league}:`, error.message);
    res
      .status(500)
      .json({ error: `Unable to fetch next match data for ${league}` });
  }
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

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../contexts/authContext";
import {
  fetchScheduledGamesInLeagueInfo,
  fetchAllFinishedGamesInLeagueInfo,
} from "../services/api/getMatchDetails";

const PredictionForm = ({ onPredictionPost }) => {
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [homeTeamStats, setHomeTeamStats] = useState(null);
  const [awayTeamStats, setAwayTeamStats] = useState(null);
  const [selectedGame, setSelectedGame] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [teamRatings, setTeamRatings] = useState({});
  const { currentUser } = useAuth();

  const styles = {
    predictionFormContainer: {
      backgroundColor: "#192734",
      borderRadius: "15px",
      padding: "20px",
      marginBottom: "20px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    predictionFormTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "15px",
      color: "#ffffff",
    },
    predictionFormSelect: {
      width: "100%",
      padding: "10px",
      marginBottom: "15px",
      backgroundColor: "#253341",
      color: "#ffffff",
      border: "1px solid #38444d",
      borderRadius: "5px",
    },
    predictionFormInput: {
      width: "45%",
      padding: "10px",
      marginBottom: "15px",
      backgroundColor: "#253341",
      color: "#ffffff",
      border: "1px solid #38444d",
      borderRadius: "5px",
    },
    predictionFormButton: {
      width: "100%",
      padding: "10px",
      backgroundColor: "#1DA1F2",
      color: "#ffffff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
    },
    winProbabilities: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "15px",
      color: "#ffffff",
    },
  };

  useEffect(() => {
    const fetchGamesAndStats = async () => {
      if (!currentUser) {
        console.log("No current User, not fetching games");
        return;
      }

      try {
        const leagueId = "bl1";
        const games = await fetchScheduledGamesInLeagueInfo(leagueId, "2024");
        const finishedGames = await fetchAllFinishedGamesInLeagueInfo(
          leagueId,
          "2023"
        );

        console.log("Finished games:", finishedGames);

        if (!Array.isArray(games)) {
          console.error("Fetched games is not an array:", games);
          return;
        }

        const gamesWithLeagueId = games.map((game) => ({ ...game, leagueId }));

        const uniqueGames = Array.from(
          new Map(
            gamesWithLeagueId.map((game) => [game.matchID, game])
          ).values()
        );

        uniqueGames.sort(
          (a, b) => new Date(a.matchDateTime) - new Date(b.matchDateTime)
        );

        setUpcomingGames(uniqueGames);

        const allTeamStats = {};
        for (const game of uniqueGames) {
          if (!allTeamStats[game.team1.teamId]) {
            allTeamStats[game.team1.teamId] = await fetchTeamStats(
              leagueId,
              game.team1.teamId
            );
          }
          if (!allTeamStats[game.team2.teamId]) {
            allTeamStats[game.team2.teamId] = await fetchTeamStats(
              leagueId,
              game.team2.teamId
            );
          }
        }

        let initialRatings = calculateInitialRatings(allTeamStats);
        console.log("Initial ratings:", initialRatings);

        let updatedRatings = updateRatings(initialRatings, finishedGames);
        console.log("Updated ratings:", updatedRatings);

        setTeamRatings(updatedRatings);
      } catch (error) {
        console.error("Error fetching scheduled games and team stats:", error);
      }
    };

    fetchGamesAndStats();
  }, [currentUser]);

  const handleGameChange = async (e) => {
    const newSelectedGame = parseInt(e.target.value, 10);
    setSelectedGame(newSelectedGame);

    const selectedGameData = upcomingGames.find(
      (game) => game.matchID === parseInt(newSelectedGame)
    );
    if (selectedGameData) {
      try {
        const [homeStats, awayStats] = await Promise.all([
          fetchTeamStats("bl1", selectedGameData.team1.teamaId),
          fetchTeamStats("bl1", selectedGameData.team2.teamId),
        ]);
        setHomeTeamStats(homeStats);
        setAwayTeamStats(awayStats);
      } catch (error) {
        console.error("Error fetching team stats:", error);
        setHomeTeamStats(null);
        setAwayTeamStats(null);
      }
    }
  };

  const fetchTeamStats = async (leagueId, teamId) => {
    try {
      const response = await axios.get(
        `http://localhost:3002/dashboard/lastTenMatches/${leagueId}/${teamId}`
      );
      const stats = response.data;

      if (!stats) {
        return null;
      }

      // If there's no matches data, create a synthetic one based on the overall stats
      if (!Array.isArray(stats.matches) || stats.matches.length === 0) {
        stats.matchResults = [
          {
            opponentId: "unknown",
            result: stats.wins > 0 ? "win" : stats.draws > 0 ? "draw" : "loss",
            goalsScored: stats.goalsScored,
            goalsConceded: stats.goalsConceded,
          },
        ];
      } else {
        stats.matchResults = stats.matches.map((match) => ({
          opponentId: match.opponentId,
          result: match.result,
          goalsScored: match.goalsScored,
          goalsConceded: match.goalsConceded,
        }));
      }

      return stats;
    } catch (error) {
      console.error(
        `Error fetching team stats for team ${teamId} in league ${leagueId}:`,
        error
      );

      return null;
    }
  };

  const calculateInitialRatings = (allTeamStats) => {
    const ratings = {};
    Object.keys(allTeamStats).forEach((teamId) => {
      ratings[teamId] = 1500; // Start with a base rating of 1500
    });
    return ratings;
  };

  const updateRatings = (ratings, matchResults) => {
    const newRatings = { ...ratings };

    matchResults.forEach((match) => {
      const homeTeamId = match.team1.teamId;
      const awayTeamId = match.team2.teamId;
      const homeScore = match.matchResults[0]?.pointsTeam1 || 0;
      const awayScore = match.matchResults[0]?.pointsTeam2 || 0;

      if (!newRatings[homeTeamId] || !newRatings[awayTeamId]) {
        console.log(
          `Skipping match, missing rating for team: ${homeTeamId} or ${awayTeamId}`
        );
        return;
      }

      const homeRating = newRatings[homeTeamId];
      const awayRating = newRatings[awayTeamId];

      console.log(
        `Before update: ${match.team1.teamName}(${homeTeamId}): ${homeRating}, ${match.team2.teamName}(${awayTeamId}): ${awayRating}`
      );

      const expectedHomeScore =
        1 / (1 + Math.pow(10, (awayRating - homeRating) / 400));
      const expectedAwayScore = 1 - expectedHomeScore;

      const actualHomeScore =
        homeScore > awayScore ? 1 : homeScore === awayScore ? 0.5 : 0;
      const actualAwayScore = 1 - actualHomeScore;

      // Calculate the upset factor
      const upsetFactor = Math.abs(actualHomeScore - expectedHomeScore);

      // Adjust K based on the upset factor
      const baseK = 32;
      const k = baseK * (1 + upsetFactor * 2); // This will increase K for unexpected results

      const homeRatingChange = k * (actualHomeScore - expectedHomeScore);
      const awayRatingChange = k * (actualAwayScore - expectedAwayScore);

      newRatings[homeTeamId] += homeRatingChange;
      newRatings[awayTeamId] += awayRatingChange;

      console.log(
        `After update: ${match.team1.teamName}(${homeTeamId}): ${newRatings[homeTeamId]}, ${match.team2.teamName}(${awayTeamId}): ${newRatings[awayTeamId]}`
      );
      console.log(
        `Rating changes: Home ${homeRatingChange.toFixed(
          2
        )}, Away ${awayRatingChange.toFixed(2)}`
      );
    });

    return newRatings;
  };

  const calculateWinProbability = (team, opponent, teamRatings) => {
    if (
      !team ||
      !opponent ||
      !teamRatings ||
      !team.teamId ||
      !opponent.teamId
    ) {
      console.log("Missing team data or ratings", {
        team,
        opponent,
        teamRatings,
      });
      return 0;
    }

    const teamId = team.teamId;
    const opponentId = opponent.teamId;

    if (!teamRatings[teamId] || !teamRatings[opponentId]) {
      console.log("Missing team ratings", { teamId, opponentId, teamRatings });
      return 0;
    }

    const teamRating = teamRatings[teamId];
    const opponentRating = teamRatings[opponentId];

    console.log(
      `Calculating probability: ${team.teamName}(${teamId}): ${teamRating} vs ${opponent.teamName}(${opponentId}): ${opponentRating}`
    );

    const winProbability =
      1 / (1 + Math.pow(10, (opponentRating - teamRating) / 400));

    console.log(`Win probability for ${team.teamName}: ${winProbability}`);

    return Math.round(winProbability * 100);
  };

  const adjustProbabilities = (prob1, prob2) => {
    const total = prob1 + prob2;
    if (total <= 100) {
      return [prob1, prob2];
    }
    const factor = 100 / total;
    return [Math.round(prob1 * factor), Math.round(prob2 * factor)];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting prediction for game: ", selectedGame);

    if (!selectedGame || !homeScore || !awayScore) {
      console.error("Please fill in all of the fields!");
      return;
    }

    const selectedGameId =
      typeof selectedGame === "string"
        ? parseInt(selectedGame, 10)
        : selectedGame;

    const game = upcomingGames.find((game) => game.matchID === selectedGameId);

    if (!game) {
      console.error(`Game with ID ${selectedGame} not found`);
      return;
    }

    if (!game.team1 || !game.team2) {
      console.error(`Game data is incomplete for game with ID ${selectedGame}`);
      return;
    }

    try {
      const prediction = {
        userId: currentUser.uid,
        matchID: selectedGame,
        homeTeam: game.team1.teamName,
        awayTeam: game.team2.teamName,
        predictedHomeScore: parseInt(homeScore),
        predictedAwayScore: parseInt(awayScore),
        timestamp: serverTimestamp(),
        type: "prediction",
        likes: [],
        comments: [],
      };

      const docRef = await addDoc(collection(db, "posts"), prediction);
      onPredictionPost({ id: docRef.id, ...prediction });

      setSelectedGame("");
      setHomeScore("");
      setAwayScore("");
    } catch (error) {
      console.error("Error submitting prediction: ", error);
    }
  };

  return (
    <div style={styles.predictionFormContainer}>
      <h3 style={styles.predictionFormTitle}>Make a Prediction</h3>
      <form onSubmit={handleSubmit}>
        <select
          value={selectedGame}
          onChange={handleGameChange}
          style={styles.predictionFormSelect}
        >
          <option value="">Select a game</option>
          {upcomingGames.map((game, index) => (
            <option
              key={`${game.matchID}-${index}`}
              value={String(game.matchID)}
            >
              {game.team1.teamName} vs {game.team2.teamName} -{" "}
              {new Date(game.matchDateTime).toLocaleString()}
            </option>
          ))}
        </select>
        {selectedGame && homeTeamStats && awayTeamStats && (
          <div style={styles.winProbabilities}>
            {(() => {
              const homeTeam = upcomingGames.find(
                (g) => g.matchID === selectedGame
              ).team1;
              const awayTeam = upcomingGames.find(
                (g) => g.matchID === selectedGame
              ).team2;

              console.log(
                "Calculating probabilities for:",
                homeTeam.teamName,
                "vs",
                awayTeam.teamName
              );
              console.log("Current team ratings:", teamRatings);

              if (
                !homeTeamStats ||
                !awayTeamStats ||
                !teamRatings[homeTeam.teamId] ||
                !teamRatings[awayTeam.teamId]
              ) {
                console.log("Missing data for probability calculation", {
                  homeTeamStats,
                  awayTeamStats,
                  homeTeamRating: teamRatings[homeTeam.teamId],
                  awayTeamRating: teamRatings[awayTeam.teamId],
                });
                return <p>Loading probabilities...</p>;
              }

              const homeProb = calculateWinProbability(
                { ...homeTeam, ...homeTeamStats },
                { ...awayTeam, ...awayTeamStats },
                teamRatings
              );
              const awayProb = calculateWinProbability(
                { ...awayTeam, ...awayTeamStats },
                { ...homeTeam, ...homeTeamStats },
                teamRatings
              );

              console.log("Calculated probabilities:", { homeProb, awayProb });

              if (isNaN(homeProb) || isNaN(awayProb)) {
                return <p>Unable to calculate probabilities</p>;
              }

              const [adjustHomeProb, adjustAwayProb] = adjustProbabilities(
                homeProb,
                awayProb
              );
              const drawProb = 100 - adjustHomeProb - adjustAwayProb;

              return (
                <>
                  <p style={{ color: "red" }}>CLUTCHTIME PROBABILITIES</p>

                  <p>
                    {homeTeam.teamName} Win Probability: {adjustHomeProb}%
                  </p>
                  <p>
                    {awayTeam.teamName} Win Probability: {adjustAwayProb}%
                  </p>
                  <p>Draw Probability: {drawProb}%</p>
                </>
              );
            })()}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <input
            type="number"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            placeholder="Home Score"
            style={styles.predictionFormInput}
          />
          <input
            type="number"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            placeholder="Away Score"
            style={styles.predictionFormInput}
          />
        </div>
        <button type="submit" style={styles.predictionFormButton}>
          Post Prediction
        </button>
      </form>
      {upcomingGames.length === 0 && <p>No upcoming games available...</p>}
    </div>
  );
};

export default PredictionForm;

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
import { fetchScheduledGamesInLeagueInfo } from "../services/api/getMatchDetails";

const PredictionForm = ({ onPredictionPost }) => {
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [homeTeamStats, setHomeTeamStats] = useState(null);
  const [awayTeamStats, setAwayTeamStats] = useState(null);
  const [selectedGame, setSelectedGame] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
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
    const fetchGames = async () => {
      if (!currentUser) {
        console.log("No current User, not fetching games");
        return;
      }

      try {
        const leagueId = "bl1";
        const games = await fetchScheduledGamesInLeagueInfo(
          setUpcomingGames,
          leagueId,
          "2024"
        );

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
      } catch (error) {
        console.error("Error fetching scheduled games:", error);
      }
    };

    fetchGames();
  }, [currentUser]);

  const handleGameChange = (e) => {
    const newSelectedGame = parseInt(e.target.value, 10);
    setSelectedGame(newSelectedGame);

    const selectedGameData = upcomingGames.find(
      (game) => game.matchID === parseInt(newSelectedGame)
    );
    if (selectedGameData) {
      fetchTeamStats("bl1", selectedGameData.team1.teamId, setHomeTeamStats);
      fetchTeamStats("bl1", selectedGameData.team2.teamId, setAwayTeamStats);
    }
  };

  const fetchTeamStats = async (leagueId, teamId, setStatsFunction) => {
    try {
      const response = await axios.get(
        `http://localhost:3002/dashboard/lastTenMatches/${leagueId}/${teamId}`
      );
      setStatsFunction(response.data);
    } catch (error) {
      console.error("Error fetching team stats: ", error);
      setStatsFunction(null);
    }
  };

  const calculateRating = (stats) => {
    console.log("Stats for rating calculation:", stats);
    if (!stats) return 0;

    // swiss system rating calculation
    const winPoints = stats.wins * 3;
    const drawPoints = stats.draws * 1;
    const goalDifference = stats.goalsScored - stats.goalsConceded;

    const rating = winPoints + drawPoints + goalDifference;

    console.log("Calculated rating:", rating);
    return rating;
  };

  const calculateWinProbability = (teamStats, opponentStats) => {
    if (!teamStats || !opponentStats) {
      console.log("Missing team stats");
      return 0;
    }

    console.log("Team stats:", teamStats);
    console.log("Opponent stats:", opponentStats);

    const teamRating = calculateRating(teamStats);
    const opponentRating = calculateRating(opponentStats);

    console.log("Team rating:", teamRating);
    console.log("Opponent rating:", opponentRating);

    if (teamRating === opponentRating) return 50;

    const ratingDifference = teamRating - opponentRating;
    const winProbability = 1 / (1 + Math.exp(-ratingDifference / 30)); // Adjusted divisor for more balanced probabilities

    console.log("Win probability:", winProbability);

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
              console.log("home team stats: ", homeTeamStats);
              console.log("away team stats: ", awayTeamStats);
              const homeTeam = upcomingGames.find(
                (g) => g.matchID === selectedGame
              ).team1.teamName;
              const awayTeam = upcomingGames.find(
                (g) => g.matchID === selectedGame
              ).team2.teamName;
              const homeProb = calculateWinProbability(
                homeTeamStats,
                awayTeamStats
              );
              const awayProb = calculateWinProbability(
                awayTeamStats,
                homeTeamStats
              );
              const [adjustHomeProb, adjustAwayProb] = adjustProbabilities(
                homeProb,
                awayProb
              );
              const drawProb = 100 - adjustHomeProb - adjustAwayProb;

              return (
                <>
                  <p>
                    {homeTeam} Win Probability: {adjustHomeProb}%
                  </p>
                  <p>
                    {awayTeam} Win Probability: {adjustAwayProb}%
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

import React, { useState, useEffect } from "react";
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
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        // Fetch user's followed leagues
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const followedLeagues = userData.followedLeagues || [];

        let allGames = [];
        for (const league of followedLeagues) {
          const games = await fetchScheduledGamesInLeagueInfo(
            setUpcomingGames,
            "bl2",
            "2024"
          );
          allGames = [...allGames, ...games];
        }

        const uniqueGames = Array.from(
          new Map(allGames.map((game) => [game.matchID, game])).values()
        );

        uniqueGames.sort(
          (a, b) => new Date(a.matchDateTime) - new Date(b.matchDateTime)
        );

        // Sort games by date
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGame || !homeScore || !awayScore) return;

    const game = upcomingGames.find((game) => game.matchID === selectedGame);
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
  };

  return (
    <div style={styles.predictionFormContainer}>
      <h3 style={styles.predictionFormTitle}>Make a Prediction</h3>
      <form onSubmit={handleSubmit}>
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          style={styles.predictionFormSelect}
        >
          <option value="">Select a game</option>
          {upcomingGames.map((game, index) => (
            <option key={`${game.matchID}-${index}`} value={game.matchID}>
              {game.team1.teamName} vs {game.team2.teamName} -{" "}
              {new Date(game.matchDateTime).toLocaleString()}
            </option>
          ))}
        </select>
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
    </div>
  );
};

export default PredictionForm;

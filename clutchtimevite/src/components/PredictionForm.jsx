import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../contexts/authContext";

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

const PredictionForm = ({ onPredictionPost }) => {
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUpcomingGames = async () => {
      const gamesRef = collection(db, "games");
      const q = query(gamesRef, where("date", ">", new Date()));
      const querySnapshot = await getDocs(q);
      const games = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUpcomingGames(games);
    };

    fetchUpcomingGames();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGame || !homeScore || !awayScore) return;

    const game = upcomingGames.find((game) => game.id === selectedGame);
    const prediction = {
      authorId: currentUser.uid,
      gameId: selectedGame,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
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
          {upcomingGames.map((game) => (
            <option key={game.id} value={game.id}>
              {game.homeTeam} vs {game.awayTeam} -{" "}
              {new Date(game.date.seconds * 1000).toLocaleString()}
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

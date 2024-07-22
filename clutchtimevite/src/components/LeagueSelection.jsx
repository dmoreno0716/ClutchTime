import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { db } from "../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";

const leagues = [
  { id: "laliga", name: "La Liga" },
  { id: "epl", name: "English Premier League" },
  { id: "bundesliga", name: "Bundesliga" },
  { id: "ucl", name: "UEFA Champions League" },
];

function LeagueSelection() {
  const [selectedLeagues, setSelectedLeagues] = useState([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLeagueToggle = (leagueId) => {
    setSelectedLeagues((prev) =>
      prev.includes(leagueId)
        ? prev.filter((id) => id !== leagueId)
        : [...prev, leagueId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      try {
        await updateDoc(userRef, {
          followedLeagues: selectedLeagues,
          hasSelectedLeagues: true,
        });
        navigate("/select-teams"); // redirects to team selection after selection
      } catch (error) {
        console.error("Error updating user's followed leagues:", error);
      }
    }
  };

  return (
    <div>
      <h2>Select Leagues to Follow</h2>
      <form onSubmit={handleSubmit}>
        {leagues.map((league) => (
          <div key={league.id}>
            <input
              type="checkbox"
              id={league.id}
              checked={selectedLeagues.includes(league.id)}
              onChange={() => handleLeagueToggle(league.id)}
            />
            <label htmlFor={league.id}>{league.name}</label>
          </div>
        ))}
        <button type="submit">Save Selections</button>
      </form>
    </div>
  );
}

export default LeagueSelection;

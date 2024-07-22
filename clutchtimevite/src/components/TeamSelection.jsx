import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { db } from "../firebase/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

const teams = {
  laliga: [
    { id: "real_madrid", name: "Real Madrid" },
    { id: "barcelona", name: "Barcelona" },
    { id: "atletico_madrid", name: "Atlético Madrid" },
    { id: "sevilla", name: "Sevilla" },
    { id: "valencia", name: "Valencia" },
    { id: "villarreal", name: "Villarreal" },
    { id: "athletic_bilbao", name: "Athletic Bilbao" },
    { id: "real_sociedad", name: "Real Sociedad" },
  ],
  epl: [
    { id: "manchester_united", name: "Manchester United" },
    { id: "manchester_city", name: "Manchester City" },
    { id: "liverpool", name: "Liverpool" },
    { id: "chelsea", name: "Chelsea" },
    { id: "arsenal", name: "Arsenal" },
    { id: "tottenham", name: "Tottenham Hotspur" },
    { id: "leicester_city", name: "Leicester City" },
    { id: "everton", name: "Everton" },
  ],
  bundesliga: [
    { id: "bayern_munich", name: "Bayern Munich" },
    { id: "borussia_dortmund", name: "Borussia Dortmund" },
    { id: "rb_leipzig", name: "RB Leipzig" },
    { id: "bayer_leverkusen", name: "Bayer Leverkusen" },
    { id: "borussia_monchengladbach", name: "Borussia Mönchengladbach" },
    { id: "wolfsburg", name: "VfL Wolfsburg" },
    { id: "eintracht_frankfurt", name: "Eintracht Frankfurt" },
    { id: "schalke_04", name: "Schalke 04" },
  ],
  ucl: [
    { id: "psg", name: "Paris Saint-Germain" },
    { id: "juventus", name: "Juventus" },
    { id: "porto", name: "FC Porto" },
    { id: "ajax", name: "Ajax" },
    { id: "benfica", name: "Benfica" },
    { id: "napoli", name: "Napoli" },
    { id: "inter_milan", name: "Inter Milan" },
    { id: "ac_milan", name: "AC Milan" },
  ],
};

const TeamSelection = () => {
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [userLeagues, setUserLeagues] = useState([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserLeagues(userData.followedLeagues || []);
          setSelectedTeams(userData.favoriteTeams || []);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleTeamToggle = (teamId) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      try {
        await updateDoc(userRef, {
          favoriteTeams: selectedTeams,
          hasSelectedTeams: true,
        });
        navigate("/feed"); // Redirect to feed after selection
      } catch (error) {
        console.error("Error updating user's favorite teams:", error);
      }
    }
  };

  return (
    <div>
      <h2>Select Your Favorite Teams</h2>
      <form onSubmit={handleSubmit}>
        {userLeagues.map((league) => (
          <div key={league}>
            <h3>{league.toUpperCase()}</h3>
            {teams[league].map((team) => (
              <div key={team.id}>
                <input
                  type="checkbox"
                  id={team.id}
                  checked={selectedTeams.includes(team.id)}
                  onChange={() => handleTeamToggle(team.id)}
                />
                <label htmlFor={team.id}>{team.name}</label>
              </div>
            ))}
          </div>
        ))}
        <button type="submit">Save Selections</button>
      </form>
    </div>
  );
};

export default TeamSelection;

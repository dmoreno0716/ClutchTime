import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const Sidebar = () => {
  const { fullName, profileImg } = useAuth();
  const { currentUser } = useAuth();
  const [favoriteTeams, setFavoriteTeams] = useState([]);
  const [followedLeagues, setFollowedLeagues] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const navigate = useNavigate();

  const sidebarStyle = {
    width: "250px",
    backgroundColor: "#181829",
    color: "white",
    padding: "20px",
    height: "100vh",
  };

  const profileStyle = {
    textAlign: "center",
    marginBottom: "20px",
  };

  const menuItemStyle = {
    padding: "10px 0",
    cursor: "pointer",
    textAlign: "center",
    borderRadius: "5px",
    transition: "background-color 0.3s ease",
  };

  const favoriteItemsStyle = {
    marginTop: "20px",
    textAlign: "center",
  };

  const itemButtonStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    backgroundColor: "#2c2c44",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setFavoriteTeams(userData.favoriteTeams || []);
            setFollowedLeagues(userData.followedLeagues || []);
            setFollowersCount(userData.followers?.length || 0);
            setFollowingCount(userData.following?.length || 0);

          }
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleFeedClick = () => {
    navigate("/feed");
  };

  const handleDashboardClick = () => {
    navigate("/home");
  };

  return (
    <div style={sidebarStyle}>
      <div style={profileStyle}>
        <img
          src={profileImg}
          alt="profile pic"
          style={{
            borderRadius: "300px",
            padding: "50px 0 0",
            height: "120px",
          }}
        />
        <h2>{fullName}</h2>
        <div className="followersAndFollowing">
          <span style={{ padding: "30px" }}>{followersCount} </span>
          <span style={{ padding: "25px" }}> {followingCount}</span>
        </div>
        <span style={{ fontSize: "80%", padding: "10px" }}>✅Followers </span>
        <span style={{ fontSize: "80%", padding: "10px" }}>➕Following</span>
      </div>
      <div
        className="menu-item"
        style={menuItemStyle}
        onClick={handleDashboardClick}
      >
        🏠 Dashboard
      </div>
      <div
        className="menu-item"
        style={menuItemStyle}
        onClick={handleFeedClick}
      >
        📰 My Feed
      </div>
      <div style={favoriteItemsStyle}>
        <h4>Favorite Teams</h4>
        {favoriteTeams.map((team, index) => (
          <button key={index} style={itemButtonStyle}>
            {team}
          </button>
        ))}
      </div>
      <div style={favoriteItemsStyle}>
        <h4>Favorite Leagues</h4>
        {followedLeagues.map((league, index) => (
          <button key={index} style={itemButtonStyle}>
            {league}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

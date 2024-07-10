import { useAuth } from "../../contexts/authContext";
import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import { fetchUserData } from "../../services/hooks/fetchUserData";
import { followUser, unFollowUser } from "../../services/api/followUser";
import { favoriteTeam, unFavoriteTeam } from "../../services/api/favoriteTeam";
import ProfileInfo from "../apiTests/Profileinfo";
import { auth } from "../../firebase/firebase";

import {
  fetchUpcomingLeagueInfo,
  fetchAllFinishedGamesInLeagueInfo,
  fetchPinnedMatchesInfo,
  fetchScheduledGamesInLeagueInfo,
} from "../../services/api/getMatchDetails";

const Home = () => {
  const [userData, setUserData] = useState({
    fullName: "NAME",
    profileImg: "IMAGEURL",
    following: [],
    followers: [],
    favoriteTeams: [],
  });
  const [leagueData, setLeagueData] = useState([]);
  const [upcomingLeagueData, setUpcomingLeagueData] = useState();
  const [finishedGamesInleagueData, setFinishedGamesInleagueData] = useState(
    []
  );
  const [scheduledGamesInleagueData, setScheduledGamesInleagueData] = useState(
    []
  );
  const [pinnedMatchesData, setPinnedMatchesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoading) {
      fetchScheduledGamesInLeagueInfo(
        setScheduledGamesInleagueData,
        "em",
        "2024"
      );
    }
  }, [isLoading]);

  const appStyle = {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
    color: "white",
  };

  const mainContentStyle = {
    flex: 1,
    display: "flex",
    backgroundColor: "#181829",
    overflowY: "auto",
    textAlign: "center",
  };

  const leftColumnStyle = {
    flex: 3,
    padding: "80px",
    overflowY: "auto",
  };

  const rightColumnStyle = {
    flex: 1,
    padding: "60px",
    display: "flex",
    flexDirection: "column",
  };

  const topBarStyle = {
    justifyContent: "space-between",
    textAlign: "left",
    padding: "20px",
    marginBottom: "20px",
  };

  const searchStyle = {
    width: "300px",
    padding: "10px",
    borderRadius: "5px",
    border: "none",
  };

  const featuredGameStyle = {
    backgroundColor: "#00A652",
    padding: "60px",
    borderRadius: "10px",
    marginBottom: "20px",
    borderStyle: "outset",
    position: "relative",
    height: "50px",
    alignItems: "center",
    display: "flex",
  };

  const featuredGameImageStyle = {
    position: "absolute",
    right: "-11%",
    top: "20%",
    transform: "translateY(-50%)",
    height: "180%",
    objectFit: "cover",
    borderRadius: "10px",
  };

  const gamesContainerStyle = {
    marginTop: "20px",
  };

  const gameButtonsStyle = {
    display: "flex",
    justifyContent: "space-evenly",
    marginBottom: "20px",
    borderBottom: "groove",
    padding: "20px",
  };

  const gameButtonStyle = {
    padding: "15px 35px",
    borderRadius: "20px",
    border: "none",
    backgroundColor: "maroon",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
  };

  const filterButtonContainerStyle = {
    display: "flex",
    //justifyContent: "flex-start",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "40px",
    marginTop: "15px",
    marginBottom: "20px",
  };

  const filterButtonStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "white",
    color: "black",
    fontSize: "12px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "background-color 0.3s ease",
  };

  const gameCardStyle = {
    backgroundColor: "white",
    color: "black",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "double",
  };

  const predictionCardStyle = {
    backgroundColor: "white",
    color: "black",
    padding: "20px",
    marginTop: "10px",
    borderRadius: "5px",
    border: "double",
  };

  const topFollowingStyle = {
    marginBottom: "20px",
    padding: "40px",
  };

  const avatarStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#ddd",
    margin: "5px",
  };

  return (
    <div style={appStyle}>
      <Sidebar />
      <div style={mainContentStyle}>
        <div style={leftColumnStyle}>
          {/* Top Bar */}
          <div style={topBarStyle}>
            <input
              type="text"
              placeholder="Search Games..."
              style={searchStyle}
            />
          </div>
          <div
            className="image"
            style={{ textAlignLast: "center", padding: "20px" }}
          ></div>
          {/* Featured Game */}
          <div style={featuredGameStyle}>
            <img
              src="https://i.pinimg.com/originals/2e/25/1c/2e251c33a9002386bcf50cda1fac0d99.png"
              style={featuredGameImageStyle}
            ></img>
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2>Featured Game</h2>
              <p>08 12 21</p>
              <p>WHU West Ham United vs Lev Bayer Leverkusen</p>
            </div>
          </div>

          {/* Football Games */}
          <div style={gamesContainerStyle}>
            <h2>Football Games</h2>
            <div style={gameButtonsStyle}>
              <button style={gameButtonStyle}>All Games</button>
              <button style={gameButtonStyle}>Live Games</button>
              <button style={gameButtonStyle}>Finished</button>
              <button style={gameButtonStyle}>Scheduled</button>
            </div>

            <div style={filterButtonContainerStyle}>
              <button style={filterButtonStyle}>Copa America</button>
              <button style={filterButtonStyle}>Euros</button>
              <button style={filterButtonStyle}>Olympics</button>
            </div>
            {/* Game Cards */}
          </div>
          <ul>
            {scheduledGamesInleagueData.map((match) => (
              <li key={match.matchID} style={gameCardStyle}>
                <img
                  src={match.team1.teamIconUrl}
                  alt={`${match.team1.teamName} logo`}
                  style={{ width: "30px", height: "30px" }}
                />
                {match.team1.teamName}
                {" vs "}
                {match.team2.teamName}
                <img
                  src={match.team2.teamIconUrl}
                  alt={`${match.team2.teamName} logo`}
                  style={{ width: "30px", height: "30px" }}
                />
                <ul>
                  <div>
                    {match.matchResults[0]?.pointsTeam1 || "0"}
                    {" - "}
                    {match.matchResults[0]?.pointsTeam2 || "0"}
                  </div>
                  <div>{match.matchDateTime}</div>
                </ul>
              </li>
            ))}
          </ul>
        </div>

        <div style={rightColumnStyle}>
          {/* Search Users */}
          <input
            type="text"
            placeholder="Search Users..."
            style={{ ...searchStyle, marginBottom: "20px" }}
          />

          {/* Top Following */}
          <div style={topFollowingStyle}>
            <h3>Top Following</h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {[...Array(10)].map((_, i) => (
                <img
                  key={i}
                  style={avatarStyle}
                  src="https://picsum.photos/200/200"
                ></img>
              ))}
            </div>
          </div>

          {/* Predictions */}
          <div>
            <h3>Your Predictions</h3>
            <div style={predictionCardStyle}>
              <p>LIVE</p>
              <p>Australia 2 - 0 England</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

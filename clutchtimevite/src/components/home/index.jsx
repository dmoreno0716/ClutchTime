import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/authContext";
import Sidebar from "../Sidebar";
import { fetchUserData } from "../../services/hooks/fetchUserData";
import { followUser, unFollowUser } from "../../services/api/followUser";
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import {
  fetchUpcomingLeagueInfo,
  fetchAllFinishedGamesInLeagueInfo,
  fetchPinnedMatchesInfo,
  fetchScheduledGamesInLeagueInfo,
  fetchLiveGamesInfo,
} from "../../services/api/getMatchDetails";

const Home = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState({
    fullName: "NAME",
    profileImg: "IMAGEURL",
    following: [],
    followers: [],
    favoriteTeams: [],
  });
  const [liveGames, setLiveGames] = useState([]);
  const [featuredGame, setFeaturedGame] = useState(null);
  const [scheduledGamesInleagueData, setScheduledGamesInleagueData] = useState(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const leagueButtons = [
    { name: "Bundesliga", shortcut: "bl1", season: "2024" },
    { name: "LaLiga", shortcut: "laliga1", season: "2023" },
    { name: "Copa America", shortcut: "CA2024", season: "2024" },
    { name: "Euros", shortcut: "em", season: "2024" },
  ];
  const [selectedLeague, setSelectedLeague] = useState(leagueButtons[0]);

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
    flex: 0.3,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    borderLeft: "1px solid #38444d",
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
    top: "50%",
    transform: "translateY(-50%)",
    height: "60px",
    width: "60px",
    objectFit: "contain",
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
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "40px",
    marginTop: "15px",
    marginBottom: "20px",
  };

  const dropdownStyle = {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "4px",
    maxHeight: "300px",
    overflowY: "auto",
    zIndex: 1000,
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    width: "100%",
  };

  const userCardStyle = {
    display: "flex",
    alignItems: "center",
    padding: "15px",
    borderBottom: "1px solid #eee",
    transition: "background-color 0.2s ease",
    fontSize: "16px",
  };

  const userCardHoverStyle = {
    ...userCardStyle,
    backgroundColor: "#f5f5f5",
  };

  const followButtonStyle = {
    marginLeft: "auto",
    padding: "8px 15px",
    borderRadius: "20px",
    border: "none",
    backgroundColor: "#1DA1F2",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.2s ease",
  };

  const gameCardStyle = {
    backgroundColor: "white",
    color: "black",
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    transition: "all 0.3s ease",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  };

  const gameCardHoverStyle = {
    ...gameCardStyle,
    transform: "translateY(-5px) scale(1.02)",
    boxShadow: "0 8px 15px rgba(0,0,0,0.2)",
    color: "red",
    borderColor: "#4CAF50",
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

  const avatarStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#ddd",
    margin: "5px",
  };

  const followingListStyle = {
    marginTop: "20px",
    backgroundColor: "#f0f2f5",
    borderRadius: "8px",
    padding: "15px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  };

  const followingListTitleStyle = {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#1DA1F2",
    borderBottom: "2px solid #1DA1F2",
    paddingBottom: "5px",
  };

  const followingItemStyle = {
    padding: "10px 15px",
    marginBottom: "8px",
    backgroundColor: "white",
    borderRadius: "4px",
    fontSize: "14px",
    color: "#14171A",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const unfollowButtonStyle = {
    padding: "5px 10px",
    backgroundColor: "#E0245E",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  };

  useEffect(() => {
    const fetchData = async () => {
      if (isLoading) {
        const liveGamesData = await fetchLiveGamesInfo();
        setLiveGames(liveGamesData);
        setFeaturedGame(liveGamesData[0] || null);

        const scheduledGames = await fetchScheduledGamesInLeagueInfo(
          selectedLeague.shortcut,
          selectedLeague.season
        );
        setScheduledGamesInleagueData(scheduledGames);

        if (currentUser) {
          const userDataFromFirestore = await fetchUserData(currentUser.uid);
          setUserData({
            ...userDataFromFirestore,
            following: userDataFromFirestore.following || [],
            followingNames: userDataFromFirestore.followingNames || {},
          });
        }

        setIsLoading(false);
      }
    };
    fetchData();
  }, [isLoading, currentUser, selectedLeague]);

  useEffect(() => {
    const fetchGames = async () => {
      let games;
      switch (selectedLeague.shortcut) {
        case "CA2024":
        case "em":
          games = await fetchAllFinishedGamesInLeagueInfo(
            selectedLeague.shortcut,
            selectedLeague.season
          );
          break;
        case "laliga1":
          games = await fetchAllFinishedGamesInLeagueInfo(
            selectedLeague.shortcut,
            selectedLeague.season
          );
          break;
        default:
          games = await fetchScheduledGamesInLeagueInfo(
            selectedLeague.shortcut,
            selectedLeague.season
          );
      }
      setScheduledGamesInleagueData(games.slice(0, 15));
    };
    fetchGames();
  }, [selectedLeague]);

  useEffect(() => {
    const searchGames = () => {
      const filteredGames = scheduledGamesInleagueData.filter(
        (game) =>
          game.team1.teamName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          game.team2.teamName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filteredGames);
    };
    searchGames();
  }, [searchTerm, scheduledGamesInleagueData]);

  useEffect(() => {
    const searchUsers = async () => {
      if (userSearchTerm.length > 2) {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("fullName", ">=", userSearchTerm.toLowerCase()),
          where("fullName", "<=", userSearchTerm.toLowerCase() + "\uf8ff")
        );
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserSearchResults(users);
        setShowUserDropdown(true);
      } else {
        setUserSearchResults([]);
        setShowUserDropdown(false);
      }
    };
    searchUsers();
  }, [userSearchTerm]);

  const handleFollowUser = async (userToFollow) => {
    if (currentUser) {
      await followUser(currentUser.uid, userToFollow.id);
      setUserData((prevState) => ({
        ...prevState,
        following: Array.isArray(prevState.following)
          ? [...prevState.following, userToFollow.id]
          : [userToFollow.id],
        followingNames: {
          ...prevState.followingNames,
          [userToFollow.id]: userToFollow.fullName,
        },
      }));
    }
  };

  const handleUnfollowUser = async (userToUnfollow) => {
    if (currentUser) {
      await unFollowUser(currentUser.uid, userToUnfollow.id);
      setUserData((prevState) => {
        const newFollowing = Array.isArray(prevState.following)
          ? prevState.following.filter((id) => id !== userToUnfollow.id)
          : [];
        const newFollowingNames = { ...prevState.followingNames };
        delete newFollowingNames[userToUnfollow.id];
        return {
          ...prevState,
          following: newFollowing,
          followingNames: newFollowingNames,
        };
      });
    }
  };

  const GameCard = React.memo(({ match }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <li
        style={isHovered ? gameCardHoverStyle : gameCardStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={match.team1.teamIconUrl}
              alt={`${match.team1.teamName} logo`}
              style={{ width: "30px", height: "30px", marginRight: "10px" }}
            />
            <span>{match.team1.teamName}</span>
          </div>
          <span style={{ fontWeight: "bold", margin: "0 10px" }}>vs</span>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{match.team2.teamName}</span>
            <img
              src={match.team2.teamIconUrl}
              alt={`${match.team2.teamName} logo`}
              style={{ width: "30px", height: "30px", marginLeft: "10px" }}
            />
          </div>
        </div>
        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <div style={{ fontWeight: "bold" }}>
            {match.matchResults[0]?.pointsTeam1 || "0"}
            {" - "}
            {match.matchResults[0]?.pointsTeam2 || "0"}
          </div>
          <div style={{ fontSize: "0.9em", color: "#666" }}>
            {new Date(match.matchDateTime).toLocaleString()}
          </div>
        </div>
      </li>
    );
  });

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Featured Game */}
          {featuredGame && (
            <div style={featuredGameStyle}>
              <img
                src={featuredGame.team1.teamIconUrl}
                style={{ ...featuredGameImageStyle, left: "10%" }}
                alt={featuredGame.team1.teamName}
              />
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <h2>Featured Game (Live)</h2>
                <p>
                  {new Date(featuredGame.matchDateTime).toLocaleDateString()}
                </p>
                <p>{`${featuredGame.team1.teamName} vs ${featuredGame.team2.teamName}`}</p>
                <p>{`${featuredGame.matchResults[0]?.pointsTeam1 || 0} - ${
                  featuredGame.matchResults[0]?.pointsTeam2 || 0
                }`}</p>
              </div>
              <img
                src={featuredGame.team2.teamIconUrl}
                style={{ ...featuredGameImageStyle, right: "10%" }}
                alt={featuredGame.team2.teamName}
              />
            </div>
          )}

          {/* Football Games */}
          <div style={gamesContainerStyle}>
            <h2>Football Games</h2>
            <div style={gameButtonsStyle}>
              <button
                style={gameButtonStyle}
                onClick={() => setSelectedLeague("bl1")}
              >
                All Games
              </button>
              <button style={gameButtonStyle}>Live Games</button>
              <button style={gameButtonStyle}>Finished</button>
              <button style={gameButtonStyle}>Scheduled</button>
            </div>

            <div style={filterButtonContainerStyle}>
              {leagueButtons.map((league) => (
                <button
                  key={league.shortcut}
                  style={{
                    ...filterButtonStyle,
                    backgroundColor:
                      selectedLeague.shortcut === league.shortcut
                        ? "#4CAF50"
                        : "white",
                    color:
                      selectedLeague.shortcut === league.shortcut
                        ? "white"
                        : "black",
                  }}
                  onClick={() => setSelectedLeague(league)}
                >
                  {league.name}
                </button>
              ))}
            </div>
            {/* Game Cards */}
          </div>
          <ul>
            <ul>
              {(searchTerm ? searchResults : scheduledGamesInleagueData).map(
                (match) => (
                  <GameCard key={match.matchID} match={match} />
                )
              )}
            </ul>
          </ul>
        </div>

        <div style={rightColumnStyle}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search Users..."
              style={{ ...searchStyle, marginBottom: "20px" }}
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
            />
            {showUserDropdown && (
              <div style={dropdownStyle}>
                {userSearchResults.map((user) => (
                  <div
                    key={user.id}
                    style={userCardStyle}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style = { ...userCardHoverStyle })
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style = { ...userCardStyle })
                    }
                  >
                    <img
                      src={user.profileImg}
                      alt={user.fullName}
                      style={avatarStyle}
                    />
                    <span>{user.fullName}</span>
                    {userData.following &&
                    userData.following.includes(user.id) ? (
                      <button
                        style={unfollowButtonStyle}
                        onClick={() => handleUnfollowUser(user)}
                      >
                        Unfollow
                      </button>
                    ) : (
                      <button
                        style={followButtonStyle}
                        onClick={() => handleFollowUser(user)}
                      >
                        Follow
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Following List */}
            <div style={followingListStyle}>
              <h3 style={followingListTitleStyle}>Following</h3>
              {userData.following && userData.following.length > 0 ? (
                userData.following.map((userId) => (
                  <div key={userId} style={followingItemStyle}>
                    <span>
                      {userData.followingNames?.[userId] || "Loading..."}
                    </span>
                    <button
                      onClick={() =>
                        handleUnfollowUser({
                          id: userId,
                          fullName: userData.followingNames?.[userId],
                        })
                      }
                      style={unfollowButtonStyle}
                    >
                      Unfollow
                    </button>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    ...followingItemStyle,
                    justifyContent: "center",
                    color: "#657786",
                  }}
                >
                  Not following anyone yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

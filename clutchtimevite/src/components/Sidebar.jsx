import React from "react";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const { fullName, profileImg } = useAuth();
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
  const favoriteTeamsStyle = {
    marginTop: "20px",
    textAlign: "center",
  };
  const teamStyle = {
    marginBottom: "15px",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const teamLogoStyle = {
    width: "24px",
    height: "24px",
    marginRight: "10px",
    objectFit: "contain",
  };

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
          <span style={{ padding: "30px" }}>10 </span>
          <span style={{ padding: "25px" }}> 20</span>
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
      <div className="menu-item" style={menuItemStyle}>
        👥 Friends List
      </div>
      <div className="menu-item" style={menuItemStyle}>
        ✉️ News
      </div>

      <div style={favoriteTeamsStyle}>
        <h4>Favorite Teams</h4>
        <div className="team-item" style={teamStyle}>
          <img
            src="https://picsum.photos/170/100"
            alt="team logo"
            style={teamLogoStyle}
          ></img>
          Real Madrid
        </div>
        <div className="team-item" style={teamStyle}>
          <img
            src="https://picsum.photos/160/100"
            alt="team logo"
            style={teamLogoStyle}
          ></img>
          Colombia
        </div>
        <div className="team-item" style={teamStyle}>
          <img
            src="https://picsum.photos/150/100"
            alt="team logo"
            style={teamLogoStyle}
          ></img>
          Inter-Miami
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

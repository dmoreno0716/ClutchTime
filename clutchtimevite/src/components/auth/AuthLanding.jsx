import React from "react";
import { Link } from "react-router-dom";

const AuthLanding = () => {
  const containerStyle = {
    width: "100%",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    color: "white",
  };

  const imageStyle = {
    width: "180px",
    height: "200px",
    borderRadius: "10px",
    marginBottom: "20px",
  };

  const buttonContainerStyle = {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  };

  const buttonStyle = {
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    textDecoration: "none",
  };

  const signInButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#3498db",
    color: "white",
  };

  const signUpButtonStyle = {
    ...buttonStyle,
    backgroundColor: "transparent",
    border: "1px solid white",
    color: "white",
  };

  return (
    <div style={containerStyle}>
      <img
        src="https://picsum.photos/180/200"
        alt="football"
        style={imageStyle}
      ></img>
      <h1>Discover all about football</h1>
      <p>Select your favorite teams and jump right in!</p>
      <div style={buttonContainerStyle}>
        <Link to="/login" style={signInButtonStyle}>
          Sign In
        </Link>
        <Link to="/register" style={signUpButtonStyle}>
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default AuthLanding;

import React, { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";
import { doCreateUserWithEmailAndPassword } from "../../../firebase/auth";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { userLoggedIn } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isRegistering) {
      setIsRegistering(true);
      await doCreateUserWithEmailAndPassword(email, password);
    }
  };

  const mainStyle = {
    width: "100%",
    height: "100vh",
    display: "flex",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  };

  const containerStyle = {
    width: "384px",
    color: "#4B5563",
    padding: "16px",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "1px solid #E5E7EB",
    borderRadius: "12px",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "24px",
  };

  const titleStyle = {
    color: "#1F2937",
    fontSize: "24px",
    fontWeight: "600",
    marginTop: "8px",
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  const labelStyle = {
    fontSize: "14px",
    color: "#4B5563",
    fontWeight: "bold",
  };

  const inputStyle = {
    width: "100%",
    marginTop: "8px",
    padding: "8px 12px",
    color: "#6B7280",
    backgroundColor: "transparent",
    outline: "none",
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    transition: "border-color 0.3s",
  };

  const buttonStyle = {
    width: "100%",
    padding: "8px 16px",
    color: "white",
    fontWeight: "500",
    borderRadius: "8px",
    backgroundColor: isRegistering ? "#9CA3AF" : "#4F46E5",
    cursor: isRegistering ? "not-allowed" : "pointer",
    transition: "background-color 0.3s",
  };

  const linkStyle = {
    textDecoration: "none",
    fontWeight: "bold",
    color: "#4F46E5",
  };

  const backButtonStyle = {
    position: "absolute",
    top: "20px",
    left: "20px",
    padding: "10px",
    color: "#4F46E5",
    textDecoration: "none",
    fontWeight: "bold",
  };

  return (
    <>
      <Link to="/" style={backButtonStyle}>
        Back
      </Link>
      {userLoggedIn && <Navigate to={"/home"} replace={true} />}

      <main style={mainStyle}>
        <div style={containerStyle}>
          <div style={headerStyle}>
            <h3 style={titleStyle}>Create a New Account</h3>
          </div>
          <form onSubmit={onSubmit} style={formStyle}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                disabled={isRegistering}
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                disabled={isRegistering}
                type="password"
                autoComplete="off"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setconfirmPassword(e.target.value);
                }}
                style={inputStyle}
              />
            </div>

            {errorMessage && (
              <span style={{ color: "#DC2626", fontWeight: "bold" }}>
                {errorMessage}
              </span>
            )}

            <button type="submit" disabled={isRegistering} style={buttonStyle}>
              {isRegistering ? "Signing Up..." : "Sign Up"}
            </button>
            <div style={{ fontSize: "14px", textAlign: "center" }}>
              Already have an account? {"   "}
              <Link to={"/login"} style={linkStyle}>
                Continue
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default Register;

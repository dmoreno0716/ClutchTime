import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import Header from "./components/header";
import Home from "./components/home";
import "./App.css";
import { AuthProvider, useAuth } from "./contexts/authContext";
import Test from "./apiTests";
import Feed from "./components/feed";
import LeagueSelection from "./components/LeagueSelection";
import { useEffect, useState } from "react";
import { db } from "./firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import TeamSelection from "./components/TeamSelection";

function AuthWrapper({ children }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserSelections = async () => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (!userData.hasSelectedLeagues) {
            navigate("/select-leagues");
          } else if (!userData.hasSelectedTeams) {
            navigate("/select-teams");
          }
        }
      }
    };
    checkUserSelections();
  }, [currentUser, navigate]);

  return children;

  if (loading) {
    return <div>Loading...</div>;
  }
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthWrapper>
          <Header></Header>
          <div className="App-content">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/test" element={<Test />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/home" element={<Home />} />
              <Route path="*" element={<Login />} />
              <Route path="/feed" element={<Feed />} />
              <Route
                path="/select-leagues"
                element={<LeagueSelection />}
              ></Route>
              <Route path="/select-teams" element={<TeamSelection />}></Route>
            </Routes>
          </div>
        </AuthWrapper>
      </AuthProvider>
    </Router>
  );
}

export default App;

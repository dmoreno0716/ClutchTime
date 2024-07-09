import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import Header from "./components/header";
import Home from "./components/home";
import "./App.css";
import { AuthProvider } from "./contexts/authContext";
import Test from "./apiTests";
import Feed from "./components/feed";

function App() {
  return (
    <Router>
      <AuthProvider>
        {/*<Header />*/}
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
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

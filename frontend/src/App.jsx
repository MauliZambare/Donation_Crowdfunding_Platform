import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./components/Dashboard/Home";
import Ngo from "./components/Dashboard/Ngo";
import Payment from "./components/Donation/Payment";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Chatbot from "./components/chatbot/Chatbot";

const App = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ On app load, check localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login", { replace: true }); // replace to prevent back button loop
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">Donation Platform</Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              {!user && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">Login</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register">Register</Link>
                  </li>
                </>
              )}
              {user && (
                <>
                  <li className="nav-item">
                    <span className="nav-link">Hello, {user.name || user.email}</span>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-outline-danger ms-2" onClick={handleLogout}>Logout</button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="/payment" element={<Payment />} />

        {/* Donor Dashboard */}
        <Route
          path="/Dashboard/Home"
          element={user?.userType?.toLowerCase() === 'donor' ? <Home /> : <Navigate to="/login" replace />}
        />

        {/* NGO Dashboard */}
        <Route
          path="/Dashboard/Ngo"
          element={user?.userType?.toLowerCase() === 'ngo' ? <Ngo /> : <Navigate to="/login" replace />}
        />
      </Routes>

      <Chatbot />
    </>
  );
};

export default App;

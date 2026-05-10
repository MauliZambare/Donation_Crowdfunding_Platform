import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Home from "./components/Dashboard/Home";
import Ngo from "./components/Dashboard/Ngo";
import Admin from "./components/Dashboard/Admin";
import Payment from "./components/Donation/Payment";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Chatbot from "./components/chatbot/Chatbot";
import AnimatedBackground from "./components/ui/AnimatedBackground";
import Navbar from "./components/ui/Navbar";
import MobileBottomNav from "./components/ui/MobileBottomNav";
import PageTransition from "./components/ui/PageTransition";

const ProtectedRoute = ({ user, allow = [], children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allow.length > 0 && !allow.includes(user.userType?.toLowerCase())) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setUser(storedUser);
      }
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login", { replace: true });
  };

  const showChatbot = useMemo(() => {
    const hiddenRoutes = ["/", "/login", "/register"];
    return Boolean(user) && !hiddenRoutes.includes(location.pathname.toLowerCase());
  }, [location.pathname, user]);

  return (
    <div className="relative min-h-screen text-slate-100">
      <AnimatedBackground />
      <Navbar user={user} onLogout={handleLogout} />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login setUser={setUser} /></PageTransition>} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            path="/payment"
            element={(
              <PageTransition>
                <ProtectedRoute user={user} allow={["donor", "ngo", "admin"]}>
                  <Payment user={user} />
                </ProtectedRoute>
              </PageTransition>
            )}
          />

          <Route
            path="/Dashboard/Home"
            element={(
              <PageTransition>
                <ProtectedRoute user={user} allow={["donor"]}>
                  <Home user={user} />
                </ProtectedRoute>
              </PageTransition>
            )}
          />

          <Route
            path="/Dashboard/Ngo"
            element={(
              <PageTransition>
                <ProtectedRoute user={user} allow={["ngo"]}>
                  <Ngo user={user} />
                </ProtectedRoute>
              </PageTransition>
            )}
          />

          <Route
            path="/Dashboard/Admin"
            element={(
              <PageTransition>
                <ProtectedRoute user={user} allow={["donor", "ngo", "admin"]}>
                  <Admin user={user} />
                </ProtectedRoute>
              </PageTransition>
            )}
          />

          <Route
            path="*"
            element={<Navigate to={user ? (user.userType?.toLowerCase() === "ngo" ? "/Dashboard/Ngo" : "/Dashboard/Home") : "/login"} replace />}
          />
        </Routes>
      </AnimatePresence>

      {showChatbot && <Chatbot />}
      <MobileBottomNav user={user} />
    </div>
  );
};

export default App;

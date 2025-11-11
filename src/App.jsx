import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Nav from "./pages/Nav";
import Home from "./pages/Home";
import AddExpense from './pages/AddExpense';
import Login from "./pages/Login";
import Account from "./pages/Account";
import History from "./pages/History";
import Footer from "./pages/Footer";
import { onAuthStateChanged } from "firebase/auth";
import Loading from './pages/Loading'
import { auth } from "./db/firebase";
import DailyExpense from "./pages/DailyExpense";
import DailyHistory from "./pages/DailyHistory";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <Loading />;

  return (
    <Router>
      <Nav isLoggedIn={!!user} />

      <Routes>
        <Route path="/home" element={user ? <Home /> : <Navigate to="/" />} />
        <Route path="/add-expense" element={user ? <AddExpense /> : <Navigate to="/" />} />
        <Route path="/daily-expense" element={user ? <DailyExpense /> : <Navigate to="/" />} />
        <Route path="/daily-history" element={user ? <DailyHistory /> : <Navigate to="/" />} />
        <Route path="/person-account" element={user ? <Account/> : <Navigate to="/" />} />
        <Route path="/history" element={user ? <History/> : <Navigate to="/" />} />
        <Route path="/" element={!user ? <Login /> : <Navigate to="/home" />} />
      </Routes>

      {/* Footer should be outside Routes */}
      <Footer />
    </Router>
  );
};

export default App;

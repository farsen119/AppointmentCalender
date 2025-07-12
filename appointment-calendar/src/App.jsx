import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import AppointmentCalendar from "./components/AppointmentCalendar";

function PrivateRoute({ children }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              <AppointmentCalendar />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
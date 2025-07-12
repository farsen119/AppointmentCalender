import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  return (
    <nav className="w-full p-4 flex justify-between items-center shadow" style={{ backgroundColor: "#013237" }}>
      <div>
        <Link to="/">
          <span className="text-white text-xl font-bold cursor-pointer hover:text-gray-300">
            Clinic Calendar
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {!isAuthenticated ? (
          <Link to="/login">
            <button
              className="px-4 py-2 rounded text-white font-medium"
              style={{ backgroundColor: "#4ca771" }}
            >
              Login
            </button>
          </Link>
        ) : (
          <>
            <Link to="/calendar">
              <button
                className="px-4 py-2 rounded text-white font-medium"
                style={{ backgroundColor: "#4ca771" }}
              >
                Calendar
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded text-white font-medium border border-white hover:bg-white hover:text-gray-800"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
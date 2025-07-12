import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";

const Navbar = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  return (
    <nav className="w-full p-4 flex justify-between items-center shadow dark:bg-gray-800 dark:text-white" 
         style={{ backgroundColor: isDarkMode ? "#1f2937" : "#013237" }}>
      <div>
        <Link to="/">
          <span className="text-white text-xl font-bold cursor-pointer hover:text-gray-300">
            Clinic Calendar
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
        
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
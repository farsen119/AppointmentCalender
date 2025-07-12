import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-4 text-dark dark:text-white">
        Welcome to the Clinic Appointment Calendar
      </h1>
      <p className="text-lg mb-8 text-accent dark:text-green-400">
        Please login to manage appointments.
      </p>
      {!isAuthenticated && (
        <Link to="/login">
          <button
            className="px-6 py-3 rounded-lg text-white font-medium text-lg shadow-lg hover:shadow-xl transition-shadow"
            style={{ backgroundColor: "#4ca771" }}
          >
            Go to Calendar
          </button>
        </Link>
      )}
    </div>
  );
};

export default Home;
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/home.css";

function Home() {
  return (
    <>
      <Navbar />

      <div className="home-container">
        <div className="hero-section">
          <h1>Every Street Has a Story</h1>
          <p>
            Discover cities, culture, and stories through a simple travel
            companion app.
          </p>

          <Link to="/cities" className="explore-btn">
            Explore Cities
          </Link>
        </div>
      </div>
    </>
  );
}

export default Home;
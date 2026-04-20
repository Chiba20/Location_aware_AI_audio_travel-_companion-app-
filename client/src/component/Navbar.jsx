import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h2 className="logo">Every Street</h2>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/cities">Cities</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
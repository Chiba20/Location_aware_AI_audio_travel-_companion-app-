import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Crown, House, Landmark, MapPinned, MessageCircle, Route } from "lucide-react";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo" aria-label="Go to welcome page">
          <span className="nav-icon nav-icon-welcome">
            <MapPinned size={18} />
          </span>
          <span>Welcome</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/app">
            <span className="nav-icon nav-icon-home">
              <House size={17} />
            </span>
            Home
          </NavLink>
          <NavLink to="/cities">
            <span className="nav-icon nav-icon-cities">
              <Landmark size={17} />
            </span>
            Cities
          </NavLink>
          <NavLink to="/journey">
            <span className="nav-icon nav-icon-journey">
              <Route size={17} />
            </span>
            Journey
          </NavLink>
          <NavLink to="/premium">
            <span className="nav-icon nav-icon-premium">
              <Crown size={17} />
            </span>
            Premium
          </NavLink>
          <NavLink to="/feedback">
            <span className="nav-icon nav-icon-feedback">
              <MessageCircle size={17} />
            </span>
            Feedback
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

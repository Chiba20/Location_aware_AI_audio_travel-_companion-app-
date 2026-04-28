import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Compass, Headphones, MessageSquare, MapPinned } from "lucide-react";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/app" className="logo" aria-label="Every Street app home">
          <MapPinned size={24} />
          <span>Every Street</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/app">
            <Compass size={18} />
            Home
          </NavLink>
          <NavLink to="/cities">
            <MapPinned size={18} />
            Cities
          </NavLink>
          <NavLink to="/journey">
            <Headphones size={18} />
            Journey
          </NavLink>
          <NavLink to="/feedback">
            <MessageSquare size={18} />
            Feedback
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

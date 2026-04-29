import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Crown, House, Landmark, MapPinned, Menu, MessageCircle, Route, X } from "lucide-react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(() => {
    return window.localStorage.getItem("everyStreetMenuOpen") === "true";
  });

  useEffect(() => {
    window.localStorage.setItem("everyStreetMenuOpen", String(menuOpen));
  }, [menuOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo" aria-label="Go to welcome page">
          <span className="nav-icon nav-icon-welcome">
            <MapPinned size={18} />
          </span>
          <span>Welcome</span>
        </Link>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
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

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

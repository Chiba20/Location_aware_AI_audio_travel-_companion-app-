import React from "react";
<<<<<<< HEAD
import { Link, NavLink } from "react-router-dom";
import { Compass, Headphones, MessageSquare, MapPinned } from "lucide-react";
=======
import { Link } from "react-router-dom";
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
<<<<<<< HEAD
        <Link to="/" className="logo" aria-label="Every Street home">
          <MapPinned size={24} />
          <span>Every Street</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/">
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
=======
        <h2 className="logo">Every Street</h2>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/cities">Cities</Link>
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe
        </div>
      </div>
    </nav>
  );
}

<<<<<<< HEAD
export default Navbar;
=======
export default Navbar;
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe

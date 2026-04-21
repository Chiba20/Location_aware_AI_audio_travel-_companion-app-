import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../component/Navbar";

function NotFound() {
  return (
    <>
      <Navbar />
      <main className="page-container">
        <div className="state-panel">
          <h1>Page not found</h1>
          <p>The route you opened does not exist in this travel companion.</p>
          <Link className="primary-btn" to="/cities">Explore cities</Link>
        </div>
      </main>
    </>
  );
}

export default NotFound;

import React from "react";
import { Link } from "react-router-dom";

function CityCard({ city }) {
  return (
    <div className="city-card">
      <h3>{city.name}</h3>
      <p><strong>State:</strong> {city.state}</p>
      <p><strong>Country:</strong> {city.country}</p>
      <p>{city.tagline}</p>

      <Link to={`/city/${city.id}`} className="view-btn">
        View Details
      </Link>
    </div>
  );
}

export default CityCard;
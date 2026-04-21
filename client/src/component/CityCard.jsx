import React from "react";
import { Link } from "react-router-dom";
<<<<<<< HEAD
import { ArrowRight, WifiOff } from "lucide-react";
import content from "../data/appContent.json";

function CityCard({ city }) {
  const image = content.heroImages[city.name] || content.heroImages.default;

  return (
    <div className="city-card">
      <img src={image} alt={`${city.name} city view`} />
      <div className="city-card-body">
        <div className="card-title-row">
          <h3>{city.name}</h3>
          {city.offlineAvailable && (
            <span className="mini-badge" title="Offline content available">
              <WifiOff size={14} />
              Offline
            </span>
          )}
        </div>
        <p className="muted">{city.state}, {city.country}</p>
        <p>{city.tagline}</p>
        <div className="chip-row">
          {(city.interests || []).slice(0, 4).map((interest) => (
            <span className="chip" key={interest}>{interest}</span>
          ))}
        </div>

        <Link to={`/city/${city.id}`} className="view-btn">
          View details
          <ArrowRight size={16} />
        </Link>
      </div>
=======

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
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe
    </div>
  );
}

<<<<<<< HEAD
export default CityCard;
=======
export default CityCard;
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe

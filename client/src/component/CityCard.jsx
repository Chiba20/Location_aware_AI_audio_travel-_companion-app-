import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, WifiOff } from "lucide-react";
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
        <div className="chip-row city-interest-actions" aria-label={`${city.name} interests`}>
          {(city.interests || []).map((interest) => (
            <Link
              className="chip interest-link"
              key={interest}
              to={`/city/${city.id}?interest=${encodeURIComponent(interest)}`}
            >
              <Sparkles size={14} />
              {interest}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CityCard;

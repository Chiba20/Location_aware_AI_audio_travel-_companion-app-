import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpenText,
  Building2,
  Church,
  Gem,
  GraduationCap,
  Landmark,
  LibraryBig,
  MapPin,
  MonitorPlay,
  Shirt,
  Store,
  Utensils,
  WifiOff,
} from "lucide-react";
import content from "../data/appContent.json";
import { hasPremiumAccess } from "../utils/premiumAccess";

const getCityImages = (cityName) => {
  const slides = content.heroImageSlides?.[cityName];
  if (slides?.length) return slides;
  return [content.heroImages[cityName] || content.heroImages.default];
};

const interestIcons = {
  academics: GraduationCap,
  architecture: Building2,
  "campus life": Landmark,
  culture: BookOpenText,
  food: Utensils,
  "hidden gems": Gem,
  history: BookOpenText,
  hostels: Building2,
  management: LibraryBig,
  markets: Store,
  "online learning": MonitorPlay,
  silk: Shirt,
  temples: Church,
};

const getInterestIcon = (interest) => {
  return interestIcons[interest.toLowerCase()] || MapPin;
};

function CityCard({ city }) {
  const images = getCityImages(city.name);
  const [imageIndex, setImageIndex] = useState(0);
  const image = images[imageIndex] || images[0];
  const hasPremium = hasPremiumAccess();

  useEffect(() => {
    setImageIndex(0);
    if (images.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setImageIndex((current) => (current + 1) % images.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [city.name, images.length]);

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
          {(city.interests || []).map((interest) => {
            const InterestIcon = getInterestIcon(interest);
            return (
              <Link
                className="chip interest-link"
                key={interest}
                to={interest === "hidden gems" && !hasPremium ? "/premium" : `/city/${city.id}?interest=${encodeURIComponent(interest)}`}
              >
                <InterestIcon size={14} />
                {interest}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CityCard;

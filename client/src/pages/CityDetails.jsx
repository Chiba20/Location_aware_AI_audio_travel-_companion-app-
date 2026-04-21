<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Clock, Headphones, MapPin, Route, Sparkles, WifiOff } from "lucide-react";
import Navbar from "../component/Navbar";
import LoadingState from "../component/LoadingState";
import ErrorState from "../component/ErrorState";
import { getCity } from "../services/api";
import content from "../data/appContent.json";

function CityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCity = () => {
    setLoading(true);
    setError("");
    getCity(id)
      .then((response) => setCity(response.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCity();
  }, [id]);

  const image = city ? content.heroImages[city.name] || content.heroImages.default : content.heroImages.default;
=======
import React from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/city.css";

function CityDetails() {
  const { id } = useParams();

  const cities = [
    {
      id: 1,
      name: "Kanchipuram",
      state: "Tamil Nadu",
      country: "India",
      tagline: "City of thousand temples",
      description:
        "Kanchipuram is known for its temple heritage, silk weaving, and cultural history."
    },
    {
      id: 2,
      name: "Madurai",
      state: "Tamil Nadu",
      country: "India",
      tagline: "Ancient cultural city",
      description:
        "Madurai is famous for Meenakshi Temple, traditional markets, and deep cultural history."
    }
  ];

  const city = cities.find((item) => item.id === parseInt(id));

  if (!city) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <h2>City not found</h2>
        </div>
      </>
    );
  }
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe

  return (
    <>
      <Navbar />

      <div className="page-container">
<<<<<<< HEAD
        {loading && <LoadingState label="Loading city stories" />}
        {error && <ErrorState message={error} onRetry={loadCity} />}

        {!loading && !error && city && (
          <>
            <section className="city-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(24,58,55,.88), rgba(24,58,55,.32)), url(${image})` }}>
              <div>
                <span className="eyebrow">{city.state}, {city.country}</span>
                <h1>{city.name}</h1>
                <p>{city.description}</p>
                <div className="hero-actions">
                  <button
                    className="primary-btn"
                    type="button"
                    onClick={() => navigate("/journey", { state: { cityId: city.id, walkId: city.walks?.[0]?.id } })}
                  >
                    Start here
                    <ArrowRight size={18} />
                  </button>
                  <Link className="secondary-btn light" to="/cities">Back to cities</Link>
                </div>
              </div>
            </section>

            <section className="detail-layout">
              <div className="main-column">
                <div className="section-heading">
                  <h2>Audio places</h2>
                  <p>These points can trigger stories when the traveller reaches the location.</p>
                </div>
                <div className="place-list">
                  {(city.places || []).map((place) => (
                    <article className="place-card" key={place.id}>
                      <div className="place-icon">
                        <MapPin size={22} />
                      </div>
                      <div>
                        <div className="card-title-row">
                          <h3>{place.name}</h3>
                          {place.isHiddenGem && <span className="mini-badge">Hidden gem</span>}
                        </div>
                        <p>{place.story}</p>
                        <div className="meta-row">
                          <span><Headphones size={15} /> {place.audio?.durationSeconds || 0}s</span>
                          <span><Route size={15} /> {place.triggerRadius}m trigger</span>
                          {place.audio?.offlineAvailable && <span><WifiOff size={15} /> Offline</span>}
                        </div>
                        <p className="did-you-know"><Sparkles size={16} /> {place.didYouKnow}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="side-panel">
                <h2>Walks</h2>
                {(city.walks || []).map((walk) => (
                  <button
                    type="button"
                    className="walk-button"
                    key={walk.id}
                    onClick={() => navigate("/journey", { state: { cityId: city.id, walkId: walk.id } })}
                  >
                    <strong>{walk.name}</strong>
                    <span>{walk.description}</span>
                    <small><Clock size={14} /> {walk.estimatedMinutes} min · {walk.distanceKm} km</small>
                  </button>
                ))}

                <h2>Sections</h2>
                <div className="chip-row">
                  {(city.availableSections || []).map((section) => (
                    <span className="chip" key={section}>{section}</span>
                  ))}
                </div>
              </aside>
            </section>
          </>
        )}
=======
        <h1>{city.name}</h1>
        <p><strong>State:</strong> {city.state}</p>
        <p><strong>Country:</strong> {city.country}</p>
        <p><strong>Tagline:</strong> {city.tagline}</p>
        <p><strong>Description:</strong> {city.description}</p>

        <div className="city-sections">
          <h3>Available Sections</h3>
          <ul>
            <li>History</li>
            <li>Hidden Gems</li>
            <li>Temple Heritage Walk</li>
            <li>Silk Weaver Street</li>
          </ul>
        </div>
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe
      </div>
    </>
  );
}

<<<<<<< HEAD
export default CityDetails;
=======
export default CityDetails;
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe

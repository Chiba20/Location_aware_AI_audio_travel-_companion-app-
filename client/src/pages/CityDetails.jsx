import React, { useEffect, useMemo, useState } from "react";
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
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

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
  const categories = useMemo(() => {
    const names = (city?.places || []).map((place) => place.category).filter(Boolean);
    return ["all", ...Array.from(new Set(names))];
  }, [city]);
  const filteredPlaces = useMemo(() => {
    return (city?.places || []).filter((place) => {
      const text = [
        place.name,
        place.category,
        place.address,
        place.contact,
        place.timings,
        place.story,
        ...(place.interests || [])
      ].join(" ").toLowerCase();
      const matchesQuery = text.includes(query.toLowerCase());
      const matchesCategory = category === "all" || place.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [city, query, category]);

  return (
    <>
      <Navbar />

      <div className="page-container">
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
                  <h2>Audio places and local data</h2>
                  <p>Stories, contacts, addresses, timings, and everyday stops for travellers in the city.</p>
                </div>
                <div className="toolbar detail-toolbar">
                  <input
                    aria-label="Search places"
                    placeholder="Search place, category, address, or contact"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <select
                    aria-label="Filter by category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item === "all" ? "All categories" : item}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="place-list">
                  {filteredPlaces.map((place) => (
                    <article className="place-card" key={place.id}>
                      <div className="place-icon">
                        <MapPin size={22} />
                      </div>
                      <div>
                        <div className="card-title-row">
                          <h3>{place.name}</h3>
                          {place.category && <span className="mini-badge">{place.category}</span>}
                          {place.isHiddenGem && <span className="mini-badge">Hidden gem</span>}
                        </div>
                        <p>{place.story}</p>
                        {(place.address || place.contact || place.timings) && (
                          <div className="practical-grid">
                            {place.address && <span><strong>Address</strong>{place.address}</span>}
                            {place.contact && <span><strong>Contact</strong>{place.contact}</span>}
                            {place.timings && <span><strong>Timing</strong>{place.timings}</span>}
                          </div>
                        )}
                        <div className="meta-row">
                          <span><Headphones size={15} /> {place.audio?.durationSeconds || 0}s</span>
                          <span><Route size={15} /> {place.triggerRadius}m trigger</span>
                          {place.audio?.offlineAvailable && <span><WifiOff size={15} /> Offline</span>}
                          {place.directionsUrl && (
                            <a href={place.directionsUrl} target="_blank" rel="noreferrer">
                              <MapPin size={15} /> Directions
                            </a>
                          )}
                        </div>
                        <p className="did-you-know"><Sparkles size={16} /> {place.didYouKnow}</p>
                      </div>
                    </article>
                  ))}
                  {filteredPlaces.length === 0 && (
                    <div className="state-panel">
                      <p>No local data matches that search.</p>
                    </div>
                  )}
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
                    <small><Clock size={14} /> {walk.estimatedMinutes} min - {walk.distanceKm} km</small>
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
      </div>
    </>
  );
}

export default CityDetails;

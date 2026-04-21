<<<<<<< HEAD
import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../component/Navbar";
import CityCard from "../component/CityCard";
import { getCities } from "../services/api";
import LoadingState from "../component/LoadingState";
import ErrorState from "../component/ErrorState";

function CitySuggestion() {
  const [cities, setCities] = useState([]);
  const [query, setQuery] = useState("");
  const [interest, setInterest] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCities = () => {
    setLoading(true);
    setError("");
    getCities()
      .then((response) => setCities(response.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCities();
  }, []);

  const interests = useMemo(() => {
    const all = cities.flatMap((city) => city.interests || []);
    return ["all", ...Array.from(new Set(all))];
  }, [cities]);

  const filteredCities = useMemo(() => {
    return cities.filter((city) => {
      const text = `${city.name} ${city.state} ${city.country} ${city.tagline}`.toLowerCase();
      const matchesQuery = text.includes(query.toLowerCase());
      const matchesInterest = interest === "all" || (city.interests || []).includes(interest);
      return matchesQuery && matchesInterest;
    });
  }, [cities, query, interest]);
=======
import React from "react";
import Navbar from "../components/Navbar";
import CityCard from "../components/CityCard";
import "../styles/city.css";

function CitySuggestions() {
  const cities = [
    {
      id: 1,
      name: "Kanchipuram",
      state: "Tamil Nadu",
      country: "India",
      tagline: "City of thousand temples"
    },
    {
      id: 2,
      name: "Madurai",
      state: "Tamil Nadu",
      country: "India",
      tagline: "Ancient cultural city"
    }
  ];
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe

  return (
    <>
      <Navbar />

      <div className="page-container">
<<<<<<< HEAD
        <div className="page-header">
          <span className="eyebrow">Suggested cities</span>
          <h1>Choose a city and let the walk tell itself</h1>
          <p>Browse offline-ready destinations, interests, stories, hidden gems, and guided routes.</p>
        </div>

        <div className="toolbar">
          <input
            aria-label="Search city"
            placeholder="Search city, state, or country"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            aria-label="Filter by interest"
            value={interest}
            onChange={(event) => setInterest(event.target.value)}
          >
            {interests.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All interests" : item}
              </option>
            ))}
          </select>
        </div>

        {loading && <LoadingState label="Loading cities" />}
        {error && <ErrorState message={error} onRetry={loadCities} />}
        {!loading && !error && (
          <div className="city-grid">
            {filteredCities.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>
        )}
=======
        <h1>Suggested Cities</h1>
        <div className="city-grid">
          {cities.map((city) => (
            <CityCard key={city.id} city={city} />
          ))}
        </div>
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe
      </div>
    </>
  );
}

<<<<<<< HEAD
export default CitySuggestion;
=======
export default CitySuggestions;
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe

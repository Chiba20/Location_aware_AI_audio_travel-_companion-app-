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

  return (
    <>
      <Navbar />

      <div className="page-container">
        <h1>Suggested Cities</h1>
        <div className="city-grid">
          {cities.map((city) => (
            <CityCard key={city.id} city={city} />
          ))}
        </div>
      </div>
    </>
  );
}

export default CitySuggestions;
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

  return (
    <>
      <Navbar />

      <div className="page-container">
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
      </div>
    </>
  );
}

export default CityDetails;
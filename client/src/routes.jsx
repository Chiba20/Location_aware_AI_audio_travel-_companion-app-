import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CitySuggestions from "./pages/CitySuggestions";
import CityDetails from "./pages/CityDetails";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cities" element={<CitySuggestions />} />
        <Route path="/city/:id" element={<CityDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
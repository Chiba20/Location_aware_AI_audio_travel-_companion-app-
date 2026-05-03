import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import CitySuggestion from "./pages/CitySuggestion";
import CityDetails from "./pages/CityDetails";
import Journey from "./pages/Journey";
import Feedback from "./pages/Feedback";
import Premium from "./pages/Premium";
import NotFound from "./pages/NotFound";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Home />} />
        <Route path="/cities" element={<CitySuggestion />} />
        <Route path="/city/:id" element={<CityDetails />} />
        <Route path="/journey" element={<Journey />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;

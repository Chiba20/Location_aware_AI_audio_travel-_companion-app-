import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
<<<<<<< HEAD
import CitySuggestion from "./pages/CitySuggestion";
import CityDetails from "./pages/CityDetails";
import Journey from "./pages/Journey";
import Feedback from "./pages/Feedback";
import NotFound from "./pages/NotFound";
=======
import CitySuggestions from "./pages/CitySuggestions";
import CityDetails from "./pages/CityDetails";
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
<<<<<<< HEAD
        <Route path="/cities" element={<CitySuggestion />} />
        <Route path="/city/:id" element={<CityDetails />} />
        <Route path="/journey" element={<Journey />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="*" element={<NotFound />} />
=======
        <Route path="/cities" element={<CitySuggestions />} />
        <Route path="/city/:id" element={<CityDetails />} />
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe
      </Routes>
    </BrowserRouter>
  );
}

<<<<<<< HEAD
export default AppRoutes;
=======
export default AppRoutes;
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe

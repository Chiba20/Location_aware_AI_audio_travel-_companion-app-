import axios from "axios";

const api = axios.create({
<<<<<<< HEAD
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 12000
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export const getHealth = () => api.get("/health");
export const getCities = () => api.get("/cities/");
export const getCity = (id) => api.get(`/cities/${id}`);
export const getPlaces = (params = {}) => api.get("/places/", { params });
export const getNearbyPlaces = (params) => api.get("/places/nearby", { params });
export const checkArrival = (placeId, location) => api.post(`/places/${placeId}/arrival`, location);
export const getWalks = () => api.get("/walks/");
export const getWalk = (id) => api.get(`/walks/${id}`);
export const getJourneys = () => api.get("/journeys/");
export const startJourney = (payload) => api.post("/journeys/start", payload);
export const updateJourneyLocation = (journeyId, location) =>
  api.patch(`/journeys/${journeyId}/location`, location);
export const endJourney = (journeyId) => api.post(`/journeys/${journeyId}/end`);
export const getFeedback = () => api.get("/feedback/");
export const createFeedback = (payload) => api.post("/feedback/", payload);

export default api;
=======
  baseURL: "http://localhost:5000/api",
});

export default api;
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe

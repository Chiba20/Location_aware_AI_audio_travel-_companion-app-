import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 12000
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const timedOut = error.code === "ECONNABORTED" || error.message?.toLowerCase().includes("timeout");
    const message =
      timedOut
        ? "The server is taking a little longer to wake up. Please tap Try again in a moment."
        : error.response?.data?.message ||
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
export const registerPremium = (payload) => api.post("/premium/register", payload);
export const loginPremium = (payload) => api.post("/premium/login", payload);
export const sendPremiumConfirmationEmail = (payload) => api.post("/premium/confirmation-email", payload);
export const getDriverRoutes = () => api.get("/premium/driver-routes");
export const createDriverRoute = (payload, adminToken) =>
  api.post("/premium/driver-routes", payload, { headers: { "X-Admin-Token": adminToken } });
export const updateDriverRoute = (routeId, payload, adminToken) =>
  api.patch(`/premium/driver-routes/${routeId}`, payload, { headers: { "X-Admin-Token": adminToken } });
export const createDriverBooking = (payload) => api.post("/premium/driver-bookings", payload);
export const getDriverAdminDashboard = (adminToken) =>
  api.get("/premium/admin/driver-dashboard", { headers: { "X-Admin-Token": adminToken } });
export const generatePersonalizedStory = (payload) => api.post("/ai/personalized-story", payload);

export default api;

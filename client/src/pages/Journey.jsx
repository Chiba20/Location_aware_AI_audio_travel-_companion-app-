import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle2, Crosshair, Headphones, MapPin, Navigation, Square } from "lucide-react";
import Navbar from "../component/Navbar";
import ErrorState from "../component/ErrorState";
import LoadingState from "../component/LoadingState";
import {
  endJourney,
  getCities,
  getPlaces,
  getWalks,
  startJourney,
  updateJourneyLocation
} from "../services/api";
import content from "../data/appContent.json";

const defaultLocation = {
  latitude: 12.8476,
  longitude: 79.6992
};

function Journey() {
  const routeLocation = useLocation();
  const [cities, setCities] = useState([]);
  const [walks, setWalks] = useState([]);
  const [places, setPlaces] = useState([]);
  const [form, setForm] = useState({
    cityId: routeLocation.state?.cityId || 1,
    walkId: routeLocation.state?.walkId || 1,
    interests: ["history"],
    narrationStyle: "casual friend",
    offlineMode: true
  });
  const [location, setLocation] = useState(defaultLocation);
  const [journey, setJourney] = useState(null);
  const [triggeredPlaces, setTriggeredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getCities(), getWalks(), getPlaces()])
      .then(([cityResponse, walkResponse, placeResponse]) => {
        setCities(cityResponse.data || []);
        setWalks(walkResponse.data || []);
        setPlaces(placeResponse.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const cityWalks = useMemo(
    () => walks.filter((walk) => walk.cityId === Number(form.cityId)),
    [walks, form.cityId]
  );

  const cityPlaces = useMemo(
    () => places.filter((place) => place.cityId === Number(form.cityId)),
    [places, form.cityId]
  );

  const selectedCity = cities.find((city) => city.id === Number(form.cityId));

  const toggleInterest = (interest) => {
    setForm((current) => {
      const exists = current.interests.includes(interest);
      return {
        ...current,
        interests: exists
          ? current.interests.filter((item) => item !== interest)
          : [...current.interests, interest]
      };
    });
  };

  const handleStart = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await startJourney({
        ...form,
        cityId: Number(form.cityId),
        walkId: Number(form.walkId)
      });
      setJourney(response.data);
      setTriggeredPlaces([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const useBrowserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not available in this browser.");
      return;
    }

    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: Number(position.coords.latitude.toFixed(7)),
          longitude: Number(position.coords.longitude.toFixed(7))
        });
        setBusy(false);
      },
      () => {
        setError("Could not read your browser location. You can still enter coordinates manually.");
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleUpdateLocation = async () => {
    if (!journey) return;
    setBusy(true);
    setError("");
    try {
      const response = await updateJourneyLocation(journey.id, location);
      setJourney(response.data.journey);
      setTriggeredPlaces(response.data.triggeredPlaces || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleEnd = async () => {
    if (!journey) return;
    setBusy(true);
    setError("");
    try {
      const response = await endJourney(journey.id);
      setJourney(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-container">
        <div className="page-header">
          <span className="eyebrow">Live journey</span>
          <h1>Test location-triggered audio stories</h1>
          <p>Start a city walk, update coordinates, and see which stories would play nearby.</p>
        </div>

        {loading && <LoadingState label="Loading journey options" />}
        {error && <ErrorState message={error} onRetry={() => setError("")} />}

        {!loading && (
          <section className="journey-grid">
            <form className="journey-form" onSubmit={(event) => event.preventDefault()}>
              <label>
                City
                <select
                  value={form.cityId}
                  onChange={(event) => setForm({ ...form, cityId: Number(event.target.value), walkId: "" })}
                >
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </label>

              <label>
                Walk
                <select
                  value={form.walkId}
                  onChange={(event) => setForm({ ...form, walkId: Number(event.target.value) })}
                >
                  <option value="">Free roam</option>
                  {cityWalks.map((walk) => (
                    <option key={walk.id} value={walk.id}>{walk.name}</option>
                  ))}
                </select>
              </label>

              <label>
                Narration style
                <select
                  value={form.narrationStyle}
                  onChange={(event) => setForm({ ...form, narrationStyle: event.target.value })}
                >
                  {content.narrationStyles.map((style) => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </label>

              <div>
                <span className="field-label">Interests</span>
                <div className="chip-row selectable">
                  {(selectedCity?.interests || []).map((interest) => (
                    <button
                      className={`chip ${form.interests.includes(interest) ? "selected" : ""}`}
                      type="button"
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <label className="check-row">
                <input
                  type="checkbox"
                  checked={form.offlineMode}
                  onChange={(event) => setForm({ ...form, offlineMode: event.target.checked })}
                />
                Offline mode
              </label>

              <button className="primary-btn full" type="button" onClick={handleStart} disabled={busy}>
                <Headphones size={18} />
                {journey ? "Restart journey" : "Start journey"}
              </button>
            </form>

            <section className="journey-panel">
              <div className="status-card">
                <div>
                  <span className="eyebrow">Status</span>
                  <h2>{journey ? `Journey #${journey.id}` : "No active journey"}</h2>
                  <p>{journey ? `${journey.status} - ${journey.narrationStyle}` : "Choose a city and start the walk."}</p>
                </div>
                {journey?.status === "active" ? <Navigation size={28} /> : <Square size={28} />}
              </div>

              <div className="coordinate-grid">
                <label>
                  Latitude
                  <input
                    type="number"
                    step="0.0000001"
                    value={location.latitude}
                    onChange={(event) => setLocation({ ...location, latitude: Number(event.target.value) })}
                  />
                </label>
                <label>
                  Longitude
                  <input
                    type="number"
                    step="0.0000001"
                    value={location.longitude}
                    onChange={(event) => setLocation({ ...location, longitude: Number(event.target.value) })}
                  />
                </label>
              </div>

              <div className="button-row">
                <button className="secondary-btn" type="button" onClick={useBrowserLocation} disabled={busy}>
                  <Crosshair size={17} />
                  Use my location
                </button>
                <button className="primary-btn" type="button" onClick={handleUpdateLocation} disabled={!journey || busy}>
                  <MapPin size={17} />
                  Check triggers
                </button>
                <button className="danger-btn" type="button" onClick={handleEnd} disabled={!journey || busy}>
                  End
                </button>
              </div>

              <div className="trigger-list">
                <h2>Triggered stories</h2>
                {triggeredPlaces.length === 0 && <p className="muted">No story triggered yet.</p>}
                {triggeredPlaces.map((place) => (
                  <article className="trigger-card" key={place.id}>
                    <CheckCircle2 size={20} />
                    <div>
                      <strong>{place.name}</strong>
                      <span>{place.distanceMeters}m away - {place.audio?.durationSeconds}s audio</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="side-panel">
              <h2>City places</h2>
              {cityPlaces.map((place) => (
                <div className="compact-place" key={place.id}>
                  <strong>{place.name}</strong>
                  <span>{place.triggerRadius}m trigger</span>
                </div>
              ))}
            </section>
          </section>
        )}
      </main>
    </>
  );
}

export default Journey;

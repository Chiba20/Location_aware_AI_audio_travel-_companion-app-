import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle2, Crosshair, Headphones, MapPin, Navigation, Pause, Play, Radio, Square } from "lucide-react";
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

const minimumAutoCheckDistanceMeters = 20;
const minimumAutoCheckIntervalMs = 8000;

const distanceBetween = (first, second) => {
  if (!first || !second) return Infinity;
  const earthRadiusMeters = 6371000;
  const lat1 = first.latitude * Math.PI / 180;
  const lat2 = second.latitude * Math.PI / 180;
  const deltaLat = (second.latitude - first.latitude) * Math.PI / 180;
  const deltaLon = (second.longitude - first.longitude) * Math.PI / 180;
  const a = Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
  const [autoTracking, setAutoTracking] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState("Start hands-free mode to listen automatically as you walk.");
  const [currentAudioPlace, setCurrentAudioPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const journeyRef = useRef(null);
  const watchIdRef = useRef(null);
  const audioRef = useRef(null);
  const playedPlaceIdsRef = useRef(new Set());
  const lastAutoCheckRef = useRef({ location: null, checkedAt: 0 });
  const checkingLocationRef = useRef(false);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setCurrentAudioPlace(null);
  };

  const stopAutoTracking = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setAutoTracking(false);
    setTrackingStatus("Hands-free mode is paused.");
  };

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

  useEffect(() => {
    journeyRef.current = journey;
  }, [journey]);

  useEffect(() => {
    return () => {
      stopAutoTracking();
      stopAudio();
    };
  }, []);

  const cityWalks = useMemo(
    () => walks.filter((walk) => walk.cityId === Number(form.cityId)),
    [walks, form.cityId]
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

  const playTriggeredAudio = (placesToPlay, options = {}) => {
    const nextPlace = placesToPlay.find((place) => {
      const audioUrl = place.audio?.url || place.audioUrl;
      return place.audioNarration && audioUrl && (options.allowReplay || !playedPlaceIdsRef.current.has(place.id));
    });

    if (!nextPlace) return;

    stopAudio();
    const audioUrl = nextPlace.audio?.url || nextPlace.audioUrl;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setCurrentAudioPlace(nextPlace);
    setTrackingStatus(`Now playing: ${nextPlace.name}`);

    audio.addEventListener("ended", () => {
      setCurrentAudioPlace(null);
      setTrackingStatus("Listening for the next nearby story.");
    }, { once: true });
    audio.addEventListener("error", () => {
      setCurrentAudioPlace(null);
      setTrackingStatus(`Could not play audio for ${nextPlace.name}.`);
    }, { once: true });
    audio.play()
      .then(() => {
        playedPlaceIdsRef.current.add(nextPlace.id);
      })
      .catch(() => {
        setCurrentAudioPlace(null);
        setTrackingStatus("Audio is ready, but the browser blocked autoplay. Tap Play audio on a triggered story.");
      });
  };

  const checkJourneyLocation = async (nextLocation, options = {}) => {
    const activeJourney = journeyRef.current;
    if (!activeJourney || checkingLocationRef.current) return;

    checkingLocationRef.current = true;
    if (!options.silent) {
      setBusy(true);
    }
    setError("");

    try {
      const response = await updateJourneyLocation(activeJourney.id, nextLocation);
      const nextTriggeredPlaces = response.data.triggeredPlaces || [];
      setJourney(response.data.journey);
      setTriggeredPlaces(nextTriggeredPlaces);
      if (nextTriggeredPlaces.length > 0) {
        setTrackingStatus(`${nextTriggeredPlaces.length} nearby story trigger${nextTriggeredPlaces.length === 1 ? "" : "s"} found.`);
        if (options.autoPlay) {
          playTriggeredAudio(nextTriggeredPlaces);
        }
      } else if (options.autoPlay) {
        setTrackingStatus("Listening for nearby stories.");
      }
    } catch (err) {
      setError(err.message);
      if (options.autoPlay) {
        setTrackingStatus("Location check failed. Hands-free mode is still watching your position.");
      }
    } finally {
      checkingLocationRef.current = false;
      if (!options.silent) {
        setBusy(false);
      }
    }
  };

  const createJourney = async () => {
    const response = await startJourney({
      ...form,
      cityId: Number(form.cityId),
      walkId: Number(form.walkId)
    });
    setJourney(response.data);
    journeyRef.current = response.data;
    setTriggeredPlaces([]);
    playedPlaceIdsRef.current = new Set(response.data.visitedPlaceIds || []);
    lastAutoCheckRef.current = { location: null, checkedAt: 0 };
    return response.data;
  };

  const beginHandsFreeTracking = () => {
    setTrackingStatus("Waiting for GPS permission...");
    setAutoTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const nextLocation = {
          latitude: Number(position.coords.latitude.toFixed(7)),
          longitude: Number(position.coords.longitude.toFixed(7))
        };
        setLocation(nextLocation);

        const lastCheck = lastAutoCheckRef.current;
        const movedMeters = distanceBetween(lastCheck.location, nextLocation);
        const elapsedMs = Date.now() - lastCheck.checkedAt;
        if (movedMeters < minimumAutoCheckDistanceMeters && elapsedMs < minimumAutoCheckIntervalMs) {
          setTrackingStatus("GPS is active. Waiting for meaningful movement.");
          return;
        }

        lastAutoCheckRef.current = { location: nextLocation, checkedAt: Date.now() };
        checkJourneyLocation(nextLocation, { autoPlay: true, silent: true });
      },
      () => {
        stopAutoTracking();
        setError("Could not read your live location. Please allow location access and try again.");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  };

  const handleStart = async () => {
    stopAutoTracking();
    stopAudio();
    setBusy(true);
    setError("");
    try {
      await createJourney();
      if (!navigator.geolocation) {
        setTrackingStatus("Journey started, but geolocation is not available in this browser.");
        return;
      }
      beginHandsFreeTracking();
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
    await checkJourneyLocation(location, { autoPlay: false, silent: false });
  };

  const handleStartHandsFree = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not available in this browser.");
      return;
    }

    setBusy(true);
    setError("");
    stopAudio();
    if (autoTracking) {
      stopAutoTracking();
    }

    try {
      if (!journeyRef.current || journeyRef.current.status !== "active") {
        setTrackingStatus("Starting journey...");
        await createJourney();
      }
    } catch (err) {
      setError(err.message);
      setBusy(false);
      return;
    }

    beginHandsFreeTracking();
    setBusy(false);
  };

  const handleEnd = async () => {
    if (!journey) return;
    stopAutoTracking();
    stopAudio();
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
                {journey ? "Restart hands-free journey" : "Start journey"}
              </button>
            </form>

            <section className="journey-panel">
              <div className="status-card">
                <div>
                  <span className="eyebrow">Status</span>
                  <h2>{journey ? `Journey #${journey.id}` : "No active journey"}</h2>
                  <p>{journey ? `${journey.status} - ${journey.narrationStyle}` : "Choose a city and start the walk."}</p>
                  <p className="tracking-status">{trackingStatus}</p>
                </div>
                {autoTracking ? <Radio size={28} /> : journey?.status === "active" ? <Navigation size={28} /> : <Square size={28} />}
              </div>

              {currentAudioPlace && (
                <div className="now-playing-card">
                  <Headphones size={20} />
                  <div>
                    <strong>Now playing</strong>
                    <span>{currentAudioPlace.name}</span>
                  </div>
                  <button className="secondary-btn" type="button" onClick={stopAudio}>
                    <Pause size={16} />
                    Pause
                  </button>
                </div>
              )}

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
                {!autoTracking ? (
                  <button className="primary-btn" type="button" onClick={handleStartHandsFree} disabled={busy}>
                    <Radio size={17} />
                    Resume hands-free
                  </button>
                ) : (
                  <button className="secondary-btn" type="button" onClick={stopAutoTracking}>
                    <Pause size={17} />
                    Pause hands-free
                  </button>
                )}
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
                    {place.audioNarration && (place.audio?.url || place.audioUrl) && (
                      <button className="secondary-btn" type="button" onClick={() => playTriggeredAudio([place], { allowReplay: true })}>
                        <Play size={16} />
                        Play audio
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </section>

          </section>
        )}
      </main>
    </>
  );
}

export default Journey;

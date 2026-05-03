import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle2, ExternalLink, Headphones, MapPin, Navigation, Pause, Play, Radio, Square } from "lucide-react";
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

const formatDistance = (meters) => {
  if (!Number.isFinite(meters)) return "Unknown distance";
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(2)}km`;
};

function Journey() {
  const routeLocation = useLocation();
  const [cities, setCities] = useState([]);
  const [walks, setWalks] = useState([]);
  const [places, setPlaces] = useState([]);
  const [form, setForm] = useState({
    cityId: routeLocation.state?.cityId || 1,
    walkId: routeLocation.state?.walkId || 1,
    interests: [],
    narrationStyle: "casual friend",
    offlineMode: true
  });
  const [location, setLocation] = useState(defaultLocation);
  const [journey, setJourney] = useState(null);
  const [triggeredPlaces, setTriggeredPlaces] = useState([]);
  const [autoTracking, setAutoTracking] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState("Start hands-free mode to listen automatically as you walk.");
  const [currentAudioPlace, setCurrentAudioPlace] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
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
    setAudioPlaying(false);
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

  const activeCity = cities.find((city) => city.id === Number(journey?.cityId || form.cityId));
  const currentLocationMapUrl = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
  const cityInterests = useMemo(() => {
    if (activeCity?.interests?.length) return activeCity.interests;

    return [...new Set(
      places
        .filter((place) => place.cityId === Number(activeCity?.id || form.cityId))
        .flatMap((place) => place.interests || [])
    )].sort();
  }, [activeCity, form.cityId, places]);

  const readCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not available in this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: Number(position.coords.latitude.toFixed(7)),
            longitude: Number(position.coords.longitude.toFixed(7))
          });
        },
        () => reject(new Error("Could not read your live location. Please allow location access and try again.")),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      );
    });
  };

  const findNearestCityFromLocation = (nextLocation) => {
    const nearestPlace = places
      .filter((place) => place.latitude && place.longitude)
      .map((place) => ({
        ...place,
        distanceMeters: distanceBetween(nextLocation, {
          latitude: Number(place.latitude),
          longitude: Number(place.longitude)
        })
      }))
      .sort((first, second) => first.distanceMeters - second.distanceMeters)[0];

    return nearestPlace ? cities.find((city) => city.id === nearestPlace.cityId) : null;
  };

  const nearestTriggerPlace = useMemo(() => {
    const selectedInterests = form.interests.map((interest) => interest.toLowerCase());

    return places
      .filter((place) => {
        if (!place.latitude || !place.longitude) return false;
        if (selectedInterests.length === 0) return true;

        const placeInterests = (place.interests || []).map((interest) => interest.toLowerCase());
        return selectedInterests.some((interest) => placeInterests.includes(interest));
      })
      .map((place) => {
        const distanceMeters = distanceBetween(location, {
          latitude: Number(place.latitude),
          longitude: Number(place.longitude)
        });
        return {
          ...place,
          distanceMeters,
          canTrigger: distanceMeters <= Number(place.triggerRadius || 0)
        };
      })
      .sort((first, second) => first.distanceMeters - second.distanceMeters)[0];
  }, [places, form.interests, location]);
  const nearestTriggerCity = cities.find((city) => city.id === nearestTriggerPlace?.cityId);

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
    setAudioPlaying(false);
    const distanceText = Number.isFinite(nextPlace.distanceMeters)
      ? ` You are ${formatDistance(nextPlace.distanceMeters)} away.`
      : "";
    setTrackingStatus(`Now playing: ${nextPlace.name}.${distanceText}`);

    audio.addEventListener("play", () => {
      setAudioPlaying(true);
    });
    audio.addEventListener("pause", () => {
      setAudioPlaying(false);
    });
    audio.addEventListener("ended", () => {
      setAudioPlaying(false);
      setCurrentAudioPlace(null);
      setTrackingStatus("Listening for the next nearby story.");
    }, { once: true });
    audio.addEventListener("error", () => {
      setAudioPlaying(false);
      setCurrentAudioPlace(null);
      setTrackingStatus(`Could not play audio for ${nextPlace.name}.`);
    }, { once: true });
    audio.play()
      .then(() => {
        playedPlaceIdsRef.current.add(nextPlace.id);
      })
      .catch(() => {
        setAudioPlaying(false);
        setTrackingStatus("Audio is ready, but the browser blocked autoplay. Tap Play audio on a triggered story.");
      });
  };

  const toggleCurrentAudio = () => {
    if (!audioRef.current || !currentAudioPlace) return;

    if (audioRef.current.paused) {
      audioRef.current.play()
        .then(() => {
          setAudioPlaying(true);
          playedPlaceIdsRef.current.add(currentAudioPlace.id);
          setTrackingStatus(`Resumed: ${currentAudioPlace.name}.`);
        })
        .catch(() => {
          setTrackingStatus("Audio is ready, but the browser blocked resume. Tap again to play.");
        });
      return;
    }

    audioRef.current.pause();
    setAudioPlaying(false);
    setTrackingStatus(`Paused: ${currentAudioPlace.name}.`);
  };

  const checkJourneyLocation = async (nextLocation, options = {}) => {
    let activeJourney = journeyRef.current;
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

  const createJourney = async (journeyForm = form) => {
    const response = await startJourney({
      ...journeyForm,
      cityId: Number(journeyForm.cityId),
      walkId: Number(journeyForm.walkId)
    });
    setJourney(response.data);
    journeyRef.current = response.data;
    setTriggeredPlaces([]);
    playedPlaceIdsRef.current = new Set(response.data.visitedPlaceIds || []);
    lastAutoCheckRef.current = { location: null, checkedAt: 0 };
    return response.data;
  };

  const beginHandsFreeTracking = () => {
    if (watchIdRef.current !== null) {
      return;
    }

    setTrackingStatus("Waiting for GPS permission...");

    try {
      const watchId = navigator.geolocation.watchPosition(
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

      watchIdRef.current = watchId;
      setAutoTracking(true);
    } catch {
      watchIdRef.current = null;
      setAutoTracking(false);
      setError("Could not start hands-free tracking. Please allow location access and try again.");
    }
  };

  const handleStart = async () => {
    stopAutoTracking();
    stopAudio();
    setBusy(true);
    setError("");
    try {
      if (!navigator.geolocation) {
        await createJourney();
        setTrackingStatus("Journey started, but geolocation is not available in this browser.");
        return;
      }

      setTrackingStatus("Reading your location to choose the nearest city...");
      const nextLocation = await readCurrentLocation();
      setLocation(nextLocation);

      const nearestCity = findNearestCityFromLocation(nextLocation);
      let journeyForm = form;
      if (nearestCity) {
        const nearestCityWalk = walks.find((walk) => walk.cityId === nearestCity.id);
        journeyForm = {
          ...form,
          cityId: nearestCity.id,
          walkId: nearestCityWalk?.id || "",
          interests: []
        };
        setForm(journeyForm);
        setTrackingStatus(`Nearest city selected: ${nearestCity.name}. Starting journey...`);
      }

      await createJourney(journeyForm);
      await checkJourneyLocation(nextLocation, { autoPlay: true, silent: true });
      beginHandsFreeTracking();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateLocation = async () => {
    setError("");
    try {
      if (!journeyRef.current || journeyRef.current.status !== "active") {
        setBusy(true);
        setTrackingStatus("Starting journey for manual coordinates...");
        await createJourney();
      }
      await checkJourneyLocation(location, { autoPlay: true, silent: false });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleStartHandsFree = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not available in this browser.");
      return;
    }

    setBusy(true);
    setError("");
    stopAudio();

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

  const handleToggleHandsFree = () => {
    if (watchIdRef.current !== null) {
      stopAutoTracking();
      return;
    }

    handleStartHandsFree();
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

  const handsFreeActive = autoTracking && watchIdRef.current !== null;

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
                  onChange={(event) => setForm({
                    ...form,
                    cityId: Number(event.target.value),
                    walkId: "",
                    interests: []
                  })}
                >
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </label>

              <div>
                <span className="field-label">Interests</span>
                <div className="chip-row selectable">
                  <button
                    className={`chip ${form.interests.length === 0 ? "selected" : ""}`}
                    type="button"
                    onClick={() => setForm({ ...form, interests: [] })}
                  >
                    All interests
                  </button>
                  {cityInterests.map((interest) => (
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

              <button className="primary-btn full" type="button" onClick={handleStart} disabled={busy}>
                <Headphones size={18} />
                {journey ? "Restart hands-free journey" : "Start journey"}
              </button>
            </form>

            <section className="journey-panel">
              <div className="status-card">
                <div>
                  <span className="eyebrow">Status</span>
                  <h2>{journey ? `You are in ${activeCity?.name || "this city"}` : "No active journey"}</h2>
                  <p>{journey ? `Journey status: ${journey.status}` : "Choose a city and start the journey."}</p>
                  <p className="tracking-status">{trackingStatus}</p>
                </div>
                {handsFreeActive ? <Radio size={28} /> : journey?.status === "active" ? <Navigation size={28} /> : <Square size={28} />}
              </div>

              {currentAudioPlace && (
                <div className="now-playing-card">
                  <Headphones size={20} />
                  <div>
                    <strong>Now playing</strong>
                    <span>
                      {currentAudioPlace.name}
                      {Number.isFinite(currentAudioPlace.distanceMeters)
                        ? ` - ${formatDistance(currentAudioPlace.distanceMeters)} away`
                        : ""}
                    </span>
                  </div>
                  <button className="secondary-btn" type="button" onClick={toggleCurrentAudio}>
                    {audioPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {audioPlaying ? "Pause" : "Resume"}
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

              {nearestTriggerPlace && (
                <article className="trigger-card nearest-trigger-card">
                  <Navigation size={20} />
                  <div>
                    <strong>
                      Nearest app location: {nearestTriggerPlace.name}
                      {nearestTriggerCity ? `, ${nearestTriggerCity.name}` : ""}
                    </strong>
                    <span>
                      {formatDistance(nearestTriggerPlace.distanceMeters)} away -
                      trigger radius {formatDistance(Number(nearestTriggerPlace.triggerRadius || 0))}
                    </span>
                    <span>
                      {nearestTriggerPlace.canTrigger
                        ? "You are inside this audio trigger area."
                        : `Move about ${formatDistance(nearestTriggerPlace.distanceMeters - Number(nearestTriggerPlace.triggerRadius || 0))} closer to trigger it.`}
                    </span>
                  </div>
                  <a
                    className="secondary-btn"
                    href={`https://www.google.com/maps/search/?api=1&query=${nearestTriggerPlace.latitude},${nearestTriggerPlace.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MapPin size={16} />
                    View place
                  </a>
                </article>
              )}

              <div className="button-row">
                <button
                  className={handsFreeActive ? "secondary-btn" : "primary-btn"}
                  type="button"
                  onClick={handleToggleHandsFree}
                  disabled={busy}
                >
                  {handsFreeActive ? <Pause size={17} /> : <Radio size={17} />}
                  {handsFreeActive ? "Pause hands-free" : "Resume hands-free"}
                </button>
                <a
                  className="secondary-btn"
                  href={currentLocationMapUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin size={17} />
                  You are here
                  <ExternalLink size={13} />
                </a>
                <button className="primary-btn" type="button" onClick={handleUpdateLocation} disabled={busy}>
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

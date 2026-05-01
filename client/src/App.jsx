import { useEffect, useState } from "react";
import { Crosshair, LocateFixed, MapPinOff } from "lucide-react";
import AppRoutes from "./routes";
import { recordAppOpen } from "./utils/metrics";

const getSessionValue = (key) => {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const setSessionValue = (key, value) => {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Location permission can still work even when session storage is blocked.
  }
};

function App() {
  const [locationGate, setLocationGate] = useState(() => {
    return getSessionValue("everyStreetLocationGate") || "prompt";
  });
  const [locationMessage, setLocationMessage] = useState("");
  const [requestingLocation, setRequestingLocation] = useState(false);

  useEffect(() => {
    recordAppOpen();
  }, []);

  const requestLocationAccess = () => {
    setLocationMessage("");

    if (!navigator.geolocation) {
      setLocationGate("unavailable");
      setLocationMessage("This browser does not support location access. You can still use manual journey coordinates.");
      return;
    }

    if (!window.isSecureContext) {
      setLocationGate("unavailable");
      setLocationMessage("Location needs HTTPS or localhost. Open the app on localhost, or use HTTPS for phone testing.");
      return;
    }

    setRequestingLocation(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setSessionValue("everyStreetLocationGate", "allowed");
        setLocationGate("allowed");
        setRequestingLocation(false);
      },
      (error) => {
        const denied = error.code === error.PERMISSION_DENIED;
        setLocationGate(denied ? "denied" : "prompt");
        setLocationMessage(
          denied
            ? "Location permission was blocked. Enable it in your browser settings to trigger nearby audio automatically."
            : "Could not read your location right now. Check GPS/location services and try again."
        );
        setRequestingLocation(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  };

  const continueWithoutLocation = () => {
    setSessionValue("everyStreetLocationGate", "manual");
    setLocationGate("manual");
  };

  const showLocationGate = !["allowed", "manual"].includes(locationGate);

  return (
    <>
      {showLocationGate && (
        <div className="location-gate" role="dialog" aria-modal="true" aria-labelledby="location-gate-title">
          <section className="location-gate-panel">
            <div className="location-gate-icon">
              {locationGate === "denied" ? <MapPinOff size={34} /> : <LocateFixed size={34} />}
            </div>
            <span className="eyebrow">Location access</span>
            <h1 id="location-gate-title">Allow location to trigger nearby audio</h1>
            <p>
              Every Street uses your current position to detect nearby places and play the right story as you walk.
            </p>
            {locationMessage && <p className="location-gate-message">{locationMessage}</p>}
            <div className="location-gate-actions">
              <button className="primary-btn" type="button" onClick={requestLocationAccess} disabled={requestingLocation}>
                <Crosshair size={18} />
                {requestingLocation ? "Requesting location" : "Allow location"}
              </button>
              {["denied", "unavailable"].includes(locationGate) && (
                <button className="secondary-btn" type="button" onClick={continueWithoutLocation}>
                  Continue manually
                </button>
              )}
            </div>
          </section>
        </div>
      )}
      <AppRoutes />
    </>
  );
}

export default App;

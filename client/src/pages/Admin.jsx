import React, { useState } from "react";
import {
  CheckCircle2,
  IndianRupee,
  LockKeyhole,
  MapPin,
  RefreshCw,
  Route,
  ShieldCheck
} from "lucide-react";
import {
  createDriverRoute,
  getDriverAdminDashboard,
  updateDriverRoute
} from "../services/api";

const emptyRouteForm = {
  name: "",
  startPoint: "",
  endPoint: "",
  fixedPrice: ""
};

function Admin() {
  const [adminToken, setAdminToken] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [dashboard, setDashboard] = useState({ routes: [], bookings: [] });
  const [routeForm, setRouteForm] = useState(emptyRouteForm);
  const [routePriceDrafts, setRoutePriceDrafts] = useState({});

  const loadDashboard = async () => {
    setMessage("");
    if (!adminToken.trim()) {
      setMessage("Enter admin credentials first.");
      return;
    }

    setBusy(true);
    try {
      const response = await getDriverAdminDashboard(adminToken.trim());
      const routes = response.data.routes || [];
      setDashboard(response.data);
      setRoutePriceDrafts(Object.fromEntries(routes.map((route) => [route.id, String(route.fixedPrice)])));
      setUnlocked(true);
      setMessage("Admin dashboard opened.");
    } catch (err) {
      setUnlocked(false);
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveRoute = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!routeForm.name.trim() || !routeForm.startPoint.trim() || !routeForm.endPoint.trim() || !routeForm.fixedPrice) {
      setMessage("Fill route name, start, end, and fixed price.");
      return;
    }

    setBusy(true);
    try {
      await createDriverRoute({
        name: routeForm.name.trim(),
        startPoint: routeForm.startPoint.trim(),
        endPoint: routeForm.endPoint.trim(),
        fixedPrice: Number(routeForm.fixedPrice)
      }, adminToken.trim());
      setRouteForm(emptyRouteForm);
      await loadDashboard();
      setMessage("Route saved. Users will see this route with its fixed price.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const updateRoutePrice = async (route) => {
    const nextPrice = Number(routePriceDrafts[route.id]);
    setMessage("");
    if (!nextPrice || nextPrice <= 0) {
      setMessage("Enter a valid fixed price.");
      return;
    }

    setBusy(true);
    try {
      await updateDriverRoute(route.id, { fixedPrice: nextPrice }, adminToken.trim());
      await loadDashboard();
      setMessage("Route price updated.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleRoute = async (route) => {
    setMessage("");
    setBusy(true);
    try {
      await updateDriverRoute(route.id, { isActive: !route.isActive }, adminToken.trim());
      await loadDashboard();
      setMessage(route.isActive ? "Route hidden from users." : "Route restored for users.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <main className="page-container admin-page">
        {!unlocked && (
          <div className="page-header">
            <span className="eyebrow">Secure access</span>
            <h1>Admin login</h1>
            <p>Enter admin credentials to continue.</p>
          </div>
        )}

        {unlocked && (
          <div className="page-header">
            <span className="eyebrow">Admin</span>
            <h1>Driver route and payment dashboard</h1>
            <p>Manage fixed route prices and view paid driver bookings.</p>
          </div>
        )}

        <section className="admin-dashboard-layout">
          <article className="premium-card admin-login-card">
            <ShieldCheck size={24} />
            <h3>{unlocked ? "Admin session" : "Admin login"}</h3>
            <label>
              Admin token
              <input
                type="password"
                value={adminToken}
                onChange={(event) => setAdminToken(event.target.value)}
                placeholder="Enter admin token"
              />
            </label>
            <button className="primary-btn full" type="button" onClick={loadDashboard} disabled={busy}>
              <LockKeyhole size={18} />
              {busy ? "Checking" : unlocked ? "Refresh admin session" : "Login"}
            </button>
            {message && <p className="premium-message">{message}</p>}
          </article>

          {unlocked && (
            <>
              <article className="premium-card admin-driver-card">
                <Route size={24} />
                <h3>Manage routes and fixed prices</h3>
                <form className="admin-route-form" onSubmit={saveRoute}>
                  <label>
                    Route name
                    <input value={routeForm.name} onChange={(event) => setRouteForm({ ...routeForm, name: event.target.value })} placeholder="Akisha route" />
                  </label>
                  <label>
                    Start point
                    <input value={routeForm.startPoint} onChange={(event) => setRouteForm({ ...routeForm, startPoint: event.target.value })} placeholder="Pickup area" />
                  </label>
                  <label>
                    End point
                    <input value={routeForm.endPoint} onChange={(event) => setRouteForm({ ...routeForm, endPoint: event.target.value })} placeholder="Drop area" />
                  </label>
                  <label>
                    Fixed price
                    <input type="number" min="1" value={routeForm.fixedPrice} onChange={(event) => setRouteForm({ ...routeForm, fixedPrice: event.target.value })} placeholder="350" />
                  </label>
                  <button className="primary-btn full" type="submit" disabled={busy}>
                    <CheckCircle2 size={18} />
                    Save route
                  </button>
                </form>

                <div className="admin-list">
                  <strong>Current routes</strong>
                  {dashboard.routes.map((route) => (
                    <div className="admin-row" key={route.id}>
                      <span>{route.name} - Rs. {route.fixedPrice}</span>
                      <small>{route.startPoint} to {route.endPoint}</small>
                      <label>
                        Fixed price
                        <input
                          type="number"
                          min="1"
                          value={routePriceDrafts[route.id] || ""}
                          onChange={(event) => setRoutePriceDrafts({ ...routePriceDrafts, [route.id]: event.target.value })}
                        />
                      </label>
                      <div className="admin-row-actions">
                        <button type="button" onClick={() => updateRoutePrice(route)} disabled={busy}>
                          Update price
                        </button>
                        <button type="button" onClick={() => toggleRoute(route)} disabled={busy}>
                          {route.isActive ? "Hide" : "Restore"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="premium-card admin-driver-card">
                <IndianRupee size={24} />
                <h3>Paid bookings and driver location</h3>
                <button className="secondary-btn full" type="button" onClick={loadDashboard} disabled={busy}>
                  <RefreshCw size={18} />
                  Refresh dashboard
                </button>

                <div className="admin-list">
                  <strong>Paid driver bookings</strong>
                  {dashboard.bookings.length === 0 && <p>No driver bookings yet.</p>}
                  {dashboard.bookings.map((booking) => (
                    <div className="admin-row" key={booking.id}>
                      <span>{booking.driverName} - Rs. {booking.paidPrice}</span>
                      <small>{booking.routeName} for {booking.travellerName || booking.travellerEmail}</small>
                      <small>UPI: {booking.upiReference}</small>
                      {booking.driverLocation ? (
                        <a
                          href={`https://www.google.com/maps?q=${booking.driverLocation.latitude},${booking.driverLocation.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MapPin size={14} />
                          Live location
                        </a>
                      ) : (
                        <small>No live location yet</small>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            </>
          )}
        </section>
      </main>
    </>
  );
}

export default Admin;

import React, { useEffect, useMemo, useState } from "react";
import {
  Bike,
  Bus,
  CheckCircle2,
  Download,
  IndianRupee,
  LockKeyhole,
  LogIn,
  MapPin,
  Phone,
  QrCode,
  RefreshCw,
  Route,
  Settings,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import Navbar from "../component/Navbar";
import {
  createDriverBooking,
  createDriverRoute,
  getDriverAdminDashboard,
  getDriverRoutes,
  loginPremium,
  registerPremium,
  updateDriverRoute
} from "../services/api";
import { recordMetric } from "../utils/metrics";
import {
  clearPremiumSession,
  getPremiumSession,
  savePremiumSession
} from "../utils/premiumAccess";

const PREMIUM_AMOUNT = 199;
const UPI_ID = "8754147468@ptaxis";
const UPI_NAME = "Zakariya Yahya Ally";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emptyRegistrationForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  upiReference: ""
};
const emptyRouteForm = {
  name: "",
  startPoint: "",
  endPoint: "",
  fixedPrice: ""
};

const transportContacts = [
  {
    type: "Auto / Bajaj",
    icon: Bike,
    options: [
      { name: "Ravi Kumar", phone: "+91 81224 56018", note: "Auto driver and quick temple-route helper" },
      { name: "Manikandan S", phone: "+91 93441 20865", note: "Old town auto rides with local stop suggestions" },
      { name: "Arun Prakash", phone: "+91 88257 44109", note: "Railway station pickup and short heritage hops" },
      { name: "Selvam R", phone: "+91 79045 11872", note: "Flexible local trips around main temple streets" },
      { name: "Karthik B", phone: "+91 96772 45031", note: "Auto support for compact city exploring" }
    ]
  },
  {
    type: "Car taxi",
    icon: Bus,
    options: [
      { name: "Suresh Nathan", phone: "+91 73582 90443", note: "Half-day taxi with flexible sightseeing help" },
      { name: "Prabhu Raj", phone: "+91 98840 67125", note: "Full-day Kanchipuram city and silk shopping trip" },
      { name: "Vignesh M", phone: "+91 94449 30678", note: "Airport, bus stand, and railway pickup support" },
      { name: "Dinesh Kumar", phone: "+91 86102 77391", note: "Family travel with calm route planning" },
      { name: "Saravanan P", phone: "+91 70927 51466", note: "Outstation support and local guide-style stops" }
    ]
  },
  {
    type: "Scooter rental",
    icon: Bike,
    options: [
      { name: "Naveen R", phone: "+91 97910 33684", note: "Scooter handoff for solo city travel" },
      { name: "Ajay Vel", phone: "+91 90805 44219", note: "Hourly rental and nearby route tips" },
      { name: "Bala Krishnan", phone: "+91 86083 77142", note: "Day rental for flexible temple exploring" },
      { name: "Muthu S", phone: "+91 73973 20588", note: "Flexible pickup and drop support" },
      { name: "Kishore N", phone: "+91 99407 61035", note: "Local scooter support with route suggestions" }
    ]
  }
];

function Premium() {
  const [mode, setMode] = useState("register");
  const [selectedTransport, setSelectedTransport] = useState("");
  const [form, setForm] = useState(emptyRegistrationForm);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [paymentReady, setPaymentReady] = useState(false);
  const [member, setMember] = useState(() => getPremiumSession());
  const [message, setMessage] = useState("");
  const [accountBusy, setAccountBusy] = useState(false);
  const [driverRoutes, setDriverRoutes] = useState([]);
  const [selectedDriverPhone, setSelectedDriverPhone] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [routeUpiReference, setRouteUpiReference] = useState("");
  const [bookingBusy, setBookingBusy] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [adminDashboard, setAdminDashboard] = useState({ routes: [], bookings: [] });
  const [routeForm, setRouteForm] = useState(emptyRouteForm);
  const [routePriceDrafts, setRoutePriceDrafts] = useState({});
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  const upiLink = useMemo(() => {
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: UPI_NAME,
      am: String(PREMIUM_AMOUNT),
      cu: "INR",
      tn: "Every Street Premium"
    });
    return `upi://pay?${params.toString()}`;
  }, []);

  const qrUrl = useMemo(
    () => `https://quickchart.io/qr?text=${encodeURIComponent(upiLink)}&size=260&margin=2`,
    [upiLink]
  );

  const canStartPayment = form.name.trim() && form.email.trim() && form.phone.trim() && form.password.length >= 4;
  const selectedTransportContact = transportContacts.find((item) => item.type === selectedTransport);
  const selectedDriver = selectedTransportContact?.options.find((option) => option.phone === selectedDriverPhone);
  const selectedRoute = driverRoutes.find((route) => String(route.id) === selectedRouteId);
  const isAdminMode = useMemo(() => new URLSearchParams(window.location.search).get("admin") === "1", []);
  const routePaymentLink = useMemo(() => {
    if (!selectedRoute) {
      return "";
    }
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: UPI_NAME,
      am: String(selectedRoute.fixedPrice),
      cu: "INR",
      tn: `Driver route: ${selectedRoute.name}`
    });
    return `upi://pay?${params.toString()}`;
  }, [selectedRoute]);

  useEffect(() => {
    let mounted = true;
    getDriverRoutes()
      .then((response) => {
        if (mounted) {
          setDriverRoutes(response.data.routes || []);
        }
      })
      .catch((err) => setBookingMessage(err.message));
    return () => {
      mounted = false;
    };
  }, []);

  const handleStartPayment = (event) => {
    event.preventDefault();
    setMessage("");
    if (!canStartPayment) {
      setMessage("Fill name, email, phone, and a password of at least 4 characters before payment.");
      return;
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      setMessage("Enter a real email address, for example name@example.com.");
      return;
    }
    setPaymentReady(true);
  };

  const completeRegistration = async () => {
    if (!canStartPayment) {
      setMessage("Complete the registration form before confirming payment.");
      return;
    }
    if (!form.upiReference.trim()) {
      setMessage("Enter the UPI transaction reference after payment to complete registration.");
      return;
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      setMessage("Enter a real email address before completing premium registration.");
      return;
    }

    setAccountBusy(true);
    try {
      const response = await registerPremium({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        amount: PREMIUM_AMOUNT,
        upiReference: form.upiReference.trim()
      });
      const nextMember = response.data.user;
      clearPremiumSession();
      recordMetric("premium_conversion", {
        amount: PREMIUM_AMOUNT,
        email: nextMember.email,
      });
      setMember(null);
      setForm(emptyRegistrationForm);
      setLogin({ email: nextMember.email, password: "" });
      setPaymentReady(false);
      setMode("login");
      setMessage(
        response.data?.emailSent
          ? "Registration complete. Login with your premium email and password to unlock access."
          : "Registration complete. Login to unlock access. Email sending needs SMTP setup on the backend."
      );
    } catch (err) {
      setMessage(err.message);
    } finally {
      setAccountBusy(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!EMAIL_RE.test(login.email.trim())) {
      setMessage("Enter your registered premium email.");
      return;
    }
    if (!login.password) {
      setMessage("Enter your password.");
      return;
    }

    setAccountBusy(true);
    try {
      const response = await loginPremium({
        email: login.email.trim().toLowerCase(),
        password: login.password
      });
      const savedMember = response.data.user;
      savePremiumSession(savedMember);
      setMember(savedMember);
      setMessage("Welcome back. Premium access restored.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setAccountBusy(false);
    }
  };

  const logout = () => {
    clearPremiumSession();
    setMember(null);
    setMessage("Logged out from this browser.");
  };

  const handleTransportChange = (event) => {
    setSelectedTransport(event.target.value);
    setSelectedDriverPhone("");
    setSelectedRouteId("");
    setRouteUpiReference("");
    setBookingMessage("");
  };

  const bookDriverRoute = async () => {
    setBookingMessage("");
    if (!selectedDriver || !selectedRoute || !member) {
      setBookingMessage("Select a driver and route before confirming the route payment.");
      return;
    }
    if (!routeUpiReference.trim()) {
      setBookingMessage("Enter the route payment UPI reference.");
      return;
    }

    setBookingBusy(true);
    try {
      const response = await createDriverBooking({
        premiumUserId: member.id,
        driverName: selectedDriver.name,
        driverPhone: selectedDriver.phone,
        transportType: selectedTransport,
        routeId: selectedRoute.id,
        upiReference: routeUpiReference.trim()
      });
      recordMetric("premium_driver_booking", {
        route: response.data.booking.routeName,
        amount: response.data.booking.paidPrice
      });
      setRouteUpiReference("");
      setBookingMessage(`Booked ${selectedDriver.name} for ${selectedRoute.name}. Paid Rs. ${selectedRoute.fixedPrice}.`);
    } catch (err) {
      setBookingMessage(err.message);
    } finally {
      setBookingBusy(false);
    }
  };

  const loadAdminDashboard = async () => {
    setAdminMessage("");
    if (!adminToken.trim()) {
      setAdminMessage("Enter the admin token to manage routes and see driver payments.");
      return;
    }

    setAdminBusy(true);
    try {
      const response = await getDriverAdminDashboard(adminToken.trim());
      setAdminDashboard(response.data);
      setDriverRoutes((response.data.routes || []).filter((route) => route.isActive));
      setRoutePriceDrafts(
        Object.fromEntries((response.data.routes || []).map((route) => [route.id, String(route.fixedPrice)]))
      );
      setAdminUnlocked(true);
      setAdminMessage("Admin driver desk loaded.");
    } catch (err) {
      setAdminMessage(err.message);
    } finally {
      setAdminBusy(false);
    }
  };

  const saveRoute = async (event) => {
    event.preventDefault();
    setAdminMessage("");
    if (!adminToken.trim()) {
      setAdminMessage("Enter the admin token before saving a route.");
      return;
    }
    if (!routeForm.name.trim() || !routeForm.startPoint.trim() || !routeForm.endPoint.trim() || !routeForm.fixedPrice) {
      setAdminMessage("Fill route name, start, end, and fixed price.");
      return;
    }

    setAdminBusy(true);
    try {
      await createDriverRoute({
        name: routeForm.name.trim(),
        startPoint: routeForm.startPoint.trim(),
        endPoint: routeForm.endPoint.trim(),
        fixedPrice: Number(routeForm.fixedPrice)
      }, adminToken.trim());
      setRouteForm(emptyRouteForm);
      await loadAdminDashboard();
      setAdminMessage("Route added with a fixed price for every driver.");
    } catch (err) {
      setAdminMessage(err.message);
    } finally {
      setAdminBusy(false);
    }
  };

  const toggleRoute = async (route) => {
    setAdminMessage("");
    if (!adminToken.trim()) {
      setAdminMessage("Enter the admin token before changing a route.");
      return;
    }

    setAdminBusy(true);
    try {
      await updateDriverRoute(route.id, { isActive: !route.isActive }, adminToken.trim());
      await loadAdminDashboard();
      setAdminMessage(route.isActive ? "Route hidden from travellers." : "Route restored for travellers.");
    } catch (err) {
      setAdminMessage(err.message);
    } finally {
      setAdminBusy(false);
    }
  };

  const updateRoutePrice = async (route) => {
    setAdminMessage("");
    const nextPrice = Number(routePriceDrafts[route.id]);
    if (!adminToken.trim()) {
      setAdminMessage("Enter the admin token before updating a price.");
      return;
    }
    if (!nextPrice || nextPrice <= 0) {
      setAdminMessage("Enter a valid fixed route price.");
      return;
    }

    setAdminBusy(true);
    try {
      await updateDriverRoute(route.id, { fixedPrice: nextPrice }, adminToken.trim());
      await loadAdminDashboard();
      setAdminMessage("Route fixed price updated for every driver.");
    } catch (err) {
      setAdminMessage(err.message);
    } finally {
      setAdminBusy(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-container">
        <div className="page-header">
          <span className="eyebrow">Premium travel desk</span>
          <h1>Unlock offline stories, guides, and transport support</h1>
          <p>
            The app stays fully online for free users. Premium unlocks offline travel tools after registration and payment.
          </p>
        </div>

        <section className="premium-layout">
          {!member && (
            <div className="premium-access-panel">
              <div className="premium-tabs" aria-label="Premium account options">
                <button
                  className={mode === "register" ? "active" : ""}
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setMessage("");
                    setForm(emptyRegistrationForm);
                    setPaymentReady(false);
                  }}
                >
                  <UserPlus size={17} />
                  Register
                </button>
                <button
                  className={mode === "login" ? "active" : ""}
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setMessage("");
                  }}
                >
                  <LogIn size={17} />
                  Login
                </button>
              </div>

              {mode === "register" ? (
                <form className="premium-form" onSubmit={handleStartPayment} autoComplete="off">
                  <label>
                    Full name
                    <input
                      autoComplete="off"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      placeholder="Traveller name"
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      autoComplete="off"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      placeholder="name@example.com"
                    />
                  </label>
                  <label>
                    Phone
                    <input
                      autoComplete="off"
                      value={form.phone}
                      onChange={(event) => setForm({ ...form, phone: event.target.value })}
                      placeholder="+91 phone number"
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(event) => setForm({ ...form, password: event.target.value })}
                      placeholder="Minimum 4 characters"
                    />
                  </label>

                  <button className="primary-btn full" type="submit">
                    <LockKeyhole size={18} />
                    Continue to payment
                  </button>
                </form>
              ) : (
                <form className="premium-form" onSubmit={handleLogin}>
                  <label>
                    Email
                    <input
                      type="email"
                      value={login.email}
                      onChange={(event) => setLogin({ ...login, email: event.target.value })}
                      placeholder="Registered email"
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      value={login.password}
                      onChange={(event) => setLogin({ ...login, password: event.target.value })}
                      placeholder="Password"
                    />
                  </label>
                  <button className="primary-btn full" type="submit" disabled={accountBusy}>
                    <LogIn size={18} />
                    {accountBusy ? "Logging in" : "Login to premium"}
                  </button>
                </form>
              )}

              {paymentReady && mode === "register" && (
                <section className="payment-panel" aria-label="UPI payment">
                  <div>
                    <span className="eyebrow">Payment required</span>
                    <h2>Pay Rs. {PREMIUM_AMOUNT} to unlock Premium</h2>
                    <p>Registration is completed only after payment confirmation.</p>
                  </div>

                  <div className="qr-card">
                    <img src={qrUrl} alt={`UPI QR code for ${UPI_ID}`} />
                    <div>
                      <strong>{UPI_NAME}</strong>
                      <span>{UPI_ID}</span>
                    </div>
                  </div>

                  <a className="secondary-btn full" href={upiLink}>
                    <QrCode size={18} />
                    Open UPI payment app
                  </a>

                  <label>
                    UPI transaction reference
                    <input
                      value={form.upiReference}
                      onChange={(event) => setForm({ ...form, upiReference: event.target.value })}
                      placeholder="Example: UPI123456789"
                    />
                  </label>

                  <button className="primary-btn full" type="button" onClick={completeRegistration} disabled={accountBusy}>
                    <ShieldCheck size={18} />
                    {accountBusy ? "Completing registration" : "I paid, complete registration"}
                  </button>
                </section>
              )}

              {message && <p className="premium-message">{message}</p>}
            </div>
          )}

          {!member && (
            <section className="premium-summary">
              <div className="premium-price">
                <div>
                  <span>Unlock Premium</span>
                  <strong>Pay Rs. {PREMIUM_AMOUNT}</strong>
                </div>
              </div>
              <div className="premium-feature-list">
                <p><Sparkles size={17} /> Unlock Hidden Gems in Kanchipuram</p>
                <p><Phone size={17} /> Unlock Traveller Services</p>
                <p><Bus size={17} /> Unlock guide-driver contacts by transport mode</p>
                <p><Download size={17} /> Offline travel service</p>
              </div>
            </section>
          )}
        </section>

        <section className={`premium-unlocked ${member ? "unlocked-layout" : "locked"}`}>
          <div className="section-heading">
            <span className="eyebrow">{member ? "Unlocked" : "Locked preview"}</span>
            <h2>{member ? `Welcome, ${member.name}` : "Premium features"}</h2>
            <p>
              {member
                ? "You are logged in as a premium traveller. Offline tools and contacts are unlocked."
                : "Register, complete payment, and login to reveal offline tools and contacts."}
            </p>
            {member && message && <p className="success-text">{message}</p>}
            {member && (
              <button className="secondary-btn premium-logout" type="button" onClick={logout}>
                <LogIn size={16} />
                Logout
              </button>
            )}
          </div>

          <div className="premium-grid premium-grid-single">
            <article className="premium-card transport-select-card">
              <Bus size={24} />
              <h3>Driver booking</h3>
              {member ? (
                <>
                  <div className="driver-booking-flow">
                    <label>
                      Transport type
                      <select value={selectedTransport} onChange={handleTransportChange}>
                        <option value="">Choose a transport mode</option>
                        {transportContacts.map((item) => (
                          <option key={item.type} value={item.type}>{item.type}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Driver
                      <select
                        value={selectedDriverPhone}
                        onChange={(event) => setSelectedDriverPhone(event.target.value)}
                        disabled={!selectedTransportContact}
                      >
                        <option value="">Choose a driver</option>
                        {selectedTransportContact?.options.map((option) => (
                          <option key={option.phone} value={option.phone}>{option.name}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Route
                      <select
                        value={selectedRouteId}
                        onChange={(event) => setSelectedRouteId(event.target.value)}
                        disabled={!selectedTransportContact}
                      >
                        <option value="">Choose route with fixed price</option>
                        {driverRoutes.map((route) => (
                          <option key={route.id} value={route.id}>
                            {route.name} - Rs. {route.fixedPrice}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {selectedTransportContact ? (
                    <>
                      {selectedDriver && selectedRoute ? (
                        <section className="route-booking-panel">
                          <div className="selected-driver-summary">
                            <selectedTransportContact.icon size={22} />
                            <div>
                              <strong>{selectedDriver.name}</strong>
                              <a href={`tel:${selectedDriver.phone.replaceAll(" ", "")}`}>
                                <Phone size={15} />
                                {selectedDriver.phone}
                              </a>
                              <span>{selectedDriver.note}</span>
                            </div>
                          </div>
                          <div className="route-price-row">
                            <IndianRupee size={20} />
                            <div>
                              <strong>Rs. {selectedRoute.fixedPrice}</strong>
                              <span>Fixed price for every driver on this route</span>
                            </div>
                          </div>
                          <div className="route-path">
                            <MapPin size={17} />
                            <span>{selectedRoute.startPoint} to {selectedRoute.endPoint}</span>
                          </div>
                          <a className="secondary-btn full" href={routePaymentLink}>
                            <QrCode size={18} />
                            Pay route fare
                          </a>
                          <label>
                            Route payment UPI reference
                            <input
                              value={routeUpiReference}
                              onChange={(event) => setRouteUpiReference(event.target.value)}
                              placeholder="Example: ROUTE123456"
                            />
                          </label>
                          <button className="primary-btn full" type="button" onClick={bookDriverRoute} disabled={bookingBusy}>
                            <ShieldCheck size={18} />
                            {bookingBusy ? "Saving booking" : "Confirm driver booking"}
                          </button>
                        </section>
                      ) : (
                        <div className="locked-contact">
                          <Route size={22} />
                          <strong>Select route and driver</strong>
                          <span>The fixed route fare appears before payment.</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="locked-contact">
                      <LockKeyhole size={22} />
                      <strong>Select a transport mode</strong>
                      <span>Contacts will appear only after you choose your preferred mode.</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="locked-contact">
                  <LockKeyhole size={22} />
                  <strong>Guide-driver contacts are locked</strong>
                  <span>Premium login reveals transport contacts with guide-style local support.</span>
                </div>
              )}
              {bookingMessage && <p className="premium-message">{bookingMessage}</p>}
            </article>

            {member && isAdminMode && (
              <article className="premium-card admin-driver-card">
                <Settings size={24} />
                <h3>Admin driver desk</h3>
                <label>
                  Admin token
                  <input
                    type="password"
                    value={adminToken}
                    onChange={(event) => setAdminToken(event.target.value)}
                    placeholder="Admin token"
                  />
                </label>
                <button className="secondary-btn full" type="button" onClick={loadAdminDashboard} disabled={adminBusy}>
                  <RefreshCw size={18} />
                  {adminBusy ? "Loading admin desk" : "Open admin desk"}
                </button>

                {adminMessage && <p className="premium-message">{adminMessage}</p>}

                {adminUnlocked && (
                  <>
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
                      <button className="primary-btn full" type="submit" disabled={adminBusy}>
                        <CheckCircle2 size={18} />
                        Save route
                      </button>
                    </form>

                    {adminDashboard.routes.length > 0 && (
                      <div className="admin-list">
                        <strong>Managed routes</strong>
                        {adminDashboard.routes.map((route) => (
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
                              <button type="button" onClick={() => updateRoutePrice(route)} disabled={adminBusy}>
                                Update price
                              </button>
                              <button type="button" onClick={() => toggleRoute(route)} disabled={adminBusy}>
                                {route.isActive ? "Hide" : "Restore"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {adminDashboard.bookings.length > 0 && (
                      <div className="admin-list">
                        <strong>Paid driver bookings</strong>
                        {adminDashboard.bookings.map((booking) => (
                          <div className="admin-row" key={booking.id}>
                            <span>{booking.driverName} - Rs. {booking.paidPrice}</span>
                            <small>{booking.routeName} for {booking.travellerName || booking.travellerEmail}</small>
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
                    )}
                  </>
                )}
              </article>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default Premium;

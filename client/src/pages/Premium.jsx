import React, { useMemo, useState } from "react";
import {
  Bike,
  Bus,
  CheckCircle2,
  Download,
  LockKeyhole,
  LogIn,
  Phone,
  QrCode,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import Navbar from "../component/Navbar";
import { loginPremium, registerPremium } from "../services/api";
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
        </section>

        <section className={`premium-unlocked ${member ? "" : "locked"}`}>
          <div className="section-heading">
            <span className="eyebrow">{member ? "Unlocked" : "Locked preview"}</span>
            <h2>{member ? `Welcome, ${member.name}` : "Premium features"}</h2>
            <p>
              {member
                ? "You are logged in as a premium traveller. Offline tools and contacts are unlocked."
                : "Register, complete payment, and login to reveal offline tools and contacts."}
            </p>
            {member && message && <p className="success-text">{message}</p>}
          </div>

          <div className="premium-grid premium-grid-single">
            <article className="premium-card transport-select-card">
              <Bus size={24} />
              <h3>Guide-driver contacts</h3>
              {member ? (
                <>
                  <label>
                    Select your transport interest
                    <select value={selectedTransport} onChange={(event) => setSelectedTransport(event.target.value)}>
                      <option value="">Choose a transport mode</option>
                      {transportContacts.map((item) => (
                        <option key={item.type} value={item.type}>{item.type}</option>
                      ))}
                    </select>
                  </label>
                  {selectedTransportContact ? (
                    <div className="transport-options">
                    {selectedTransportContact.options.map((option) => (
                      <div className="transport-card" key={option.phone}>
                        <selectedTransportContact.icon size={22} />
                        <strong>{option.name}</strong>
                        <a href={`tel:${option.phone.replaceAll(" ", "")}`}>
                          <Phone size={15} />
                          {option.phone}
                        </a>
                        <span>{option.note}</span>
                      </div>
                    ))}
                    </div>
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
            </article>
          </div>

          {member && (
            <button className="secondary-btn premium-logout" type="button" onClick={logout}>
              Logout
            </button>
          )}
        </section>
      </main>
    </>
  );
}

export default Premium;

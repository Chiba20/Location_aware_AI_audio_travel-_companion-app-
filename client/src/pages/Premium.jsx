import React, { useMemo, useState } from "react";
import {
  Bike,
  Bus,
  CheckCircle2,
  Crown,
  Download,
  Globe2,
  LockKeyhole,
  LogIn,
  Phone,
  QrCode,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import Navbar from "../component/Navbar";

const PREMIUM_AMOUNT = 199;
const UPI_ID = "8754147468@ptaxis";
const UPI_NAME = "Zakariya Yahya Ally";

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
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    upiReference: ""
  });
  const [login, setLogin] = useState({ email: "", password: "" });
  const [paymentReady, setPaymentReady] = useState(false);
  const [member, setMember] = useState(() => {
    const saved = window.localStorage.getItem("everyStreetPremiumMember");
    return saved ? JSON.parse(saved) : null;
  });
  const [message, setMessage] = useState("");

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

  const handleStartPayment = (event) => {
    event.preventDefault();
    setMessage("");
    if (!canStartPayment) {
      setMessage("Fill name, email, phone, and a password of at least 4 characters before payment.");
      return;
    }
    setPaymentReady(true);
  };

  const completeRegistration = () => {
    if (!form.upiReference.trim()) {
      setMessage("Enter the UPI transaction reference after payment to complete registration.");
      return;
    }

    const nextMember = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      paidAmount: PREMIUM_AMOUNT,
      upiReference: form.upiReference,
      password: form.password,
      unlockedAt: new Date().toISOString()
    };
    window.localStorage.setItem("everyStreetPremiumMember", JSON.stringify(nextMember));
    setMember(nextMember);
    setMessage("Premium unlocked. Offline packs, guides, and transport contacts are ready.");
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const saved = window.localStorage.getItem("everyStreetPremiumMember");
    if (!saved) {
      setMessage("No premium registration found on this browser. Register and finish payment first.");
      return;
    }

    const savedMember = JSON.parse(saved);
    if (
      login.email.trim().toLowerCase() !== savedMember.email.toLowerCase() ||
      login.password !== savedMember.password
    ) {
      setMessage("Use the same email and password from your completed premium registration.");
      return;
    }

    setMember(savedMember);
    setMessage("Welcome back. Premium access restored.");
  };

  const logout = () => {
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
          <div className="premium-access-panel">
            <div className="premium-tabs" aria-label="Premium account options">
              <button
                className={mode === "register" ? "active" : ""}
                type="button"
                onClick={() => {
                  setMode("register");
                  setMessage("");
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
              <form className="premium-form" onSubmit={handleStartPayment}>
                <label>
                  Full name
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Traveller name"
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="name@example.com"
                  />
                </label>
                <label>
                  Phone
                  <input
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    placeholder="+91 phone number"
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
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
                <button className="primary-btn full" type="submit">
                  <LogIn size={18} />
                  Login to premium
                </button>
              </form>
            )}

            {paymentReady && mode === "register" && !member && (
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

                <button className="primary-btn full" type="button" onClick={completeRegistration}>
                  <ShieldCheck size={18} />
                  I paid, unlock premium
                </button>
              </section>
            )}

            {message && <p className={member ? "success-text" : "premium-message"}>{message}</p>}
          </div>

          <section className="premium-summary">
            <div className="premium-price">
              <div>
                <span>Unlock Premium</span>
                <strong>Pay Rs. {PREMIUM_AMOUNT}</strong>
              </div>
            </div>
            <div className="premium-feature-list">
              <p><Download size={17} /> Save travel content for offline use</p>
              <p><Bus size={17} /> Unlock guide-driver contacts</p>
              <p><Phone size={17} /> Unlock local transport support</p>
              <p><CheckCircle2 size={17} /> Keep using online features when connected</p>
              <p><Globe2 size={17} /> Audio stories stay available for everyone</p>
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
          </div>

          <div className="premium-grid">
            {transportContacts.map((transport) => (
              <article className="premium-card" key={transport.type}>
                <transport.icon size={24} />
                <h3>{transport.type}</h3>
                {member ? (
                  <div className="transport-options">
                    {transport.options.map((option) => (
                      <div className="transport-card" key={option.phone}>
                        <transport.icon size={22} />
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
                    <strong>{transport.type} contacts are locked</strong>
                    <span>Premium login reveals driver details and guide-style local support.</span>
                  </div>
                )}
              </article>
            ))}
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

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Headphones, Map, Sparkles, WifiOff } from "lucide-react";
import Navbar from "../component/Navbar";
import { getCities, getHealth } from "../services/api";
import content from "../data/appContent.json";
import LoadingState from "../component/LoadingState";

function Home() {
  const [cities, setCities] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([getHealth(), getCities()]).then(([health, citiesResult]) => {
      if (!mounted) return;
      setApiOnline(health.status === "fulfilled");
      if (citiesResult.status === "fulfilled") {
        setCities(citiesResult.value.data || []);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Navbar />

      <div className="home-container">
        <div className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">Location-aware audio companion</span>
            <h1>{content.brand.tagline}</h1>
            <p>{content.brand.promise}</p>

            <div className="hero-actions">
              <Link to="/cities" className="primary-btn">
                Explore cities
                <ArrowRight size={18} />
              </Link>
              <Link to="/journey" className="secondary-btn">
                Start journey
              </Link>
            </div>
          </div>

          <div className="hero-panel" aria-label="App preview">
            <div className="phone-shell">
              <div className="phone-map">
                <span className="map-pin pin-one" />
                <span className="map-pin pin-two" />
                <span className="route-line" />
              </div>
              <div className="audio-card">
                <Headphones size={20} />
                <div>
                  <strong>Story ready nearby</strong>
                  <span>Ekambareswarar Temple</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="quick-stats" aria-label="App status">
          <div>
            <strong>{apiOnline ? "Online" : "Offline"}</strong>
            <span>Backend status</span>
          </div>
          <div>
            <strong>{cities.length}</strong>
            <span>Available cities</span>
          </div>
          <div>
            <strong>4</strong>
            <span>Narration styles</span>
          </div>
        </section>

        <section className="feature-grid" aria-label="Core features">
          {loading ? (
            <LoadingState label="Checking app data" />
          ) : (
            content.features.map((feature, index) => {
              const icons = [Headphones, Sparkles, WifiOff];
              const Icon = icons[index] || Map;
              return (
                <article className="feature-item" key={feature.title}>
                  <Icon size={24} />
                  <h2>{feature.title}</h2>
                  <p>{feature.text}</p>
                </article>
              );
            })
          )}
        </section>
      </div>
    </>
  );
}

export default Home;

import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import content from "../data/appContent.json";

function Landing() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-content">
          <span className="eyebrow">Location-aware travel companion</span>
          <h1>{content.brand.name}</h1>
          <p>
            Explore landmarks, culture, and nearby stories with an audio guide that follows
            where your journey takes you.
          </p>
          <div className="hero-actions">
            <Link to="/app" className="primary-btn">
              Start Explore
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Landing;

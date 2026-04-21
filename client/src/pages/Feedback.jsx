import React, { useEffect, useState } from "react";
import { MessageSquare, Send, Star } from "lucide-react";
import Navbar from "../component/Navbar";
import LoadingState from "../component/LoadingState";
import ErrorState from "../component/ErrorState";
import { createFeedback, getCities, getFeedback, getPlaces } from "../services/api";

function Feedback() {
  const [cities, setCities] = useState([]);
  const [places, setPlaces] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [form, setForm] = useState({
    cityId: 1,
    placeId: 1,
    journeyId: "",
    rating: 5,
    comment: ""
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = () => {
    setLoading(true);
    setError("");
    Promise.all([getCities(), getPlaces(), getFeedback()])
      .then(([cityResponse, placeResponse, feedbackResponse]) => {
        setCities(cityResponse.data || []);
        setPlaces(placeResponse.data || []);
        setFeedback(feedbackResponse.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const cityPlaces = places.filter((place) => place.cityId === Number(form.cityId));

  const submitFeedback = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccessMessage("");
    try {
      await createFeedback({
        journeyId: form.journeyId ? Number(form.journeyId) : null,
        cityId: Number(form.cityId),
        placeId: Number(form.placeId),
        rating: Number(form.rating),
        comment: form.comment
      });
      setForm((current) => ({ ...current, comment: "" }));
      setSuccessMessage("Feedback saved.");
      const response = await getFeedback();
      setFeedback(response.data || []);
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
          <span className="eyebrow">Traveller feedback</span>
          <h1>Capture reviews and sentiment</h1>
          <p>Ratings and comments help validate whether the audio experience feels useful, personal, and memorable.</p>
        </div>

        {loading && <LoadingState label="Loading feedback tools" />}
        {error && <ErrorState message={error} onRetry={loadData} />}

        {!loading && (
          <section className="feedback-layout">
            <form className="feedback-form" onSubmit={submitFeedback}>
              <label>
                City
                <select
                  value={form.cityId}
                  onChange={(event) => setForm({ ...form, cityId: Number(event.target.value), placeId: "" })}
                >
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </label>

              <label>
                Place
                <select
                  value={form.placeId}
                  onChange={(event) => setForm({ ...form, placeId: Number(event.target.value) })}
                >
                  {cityPlaces.map((place) => (
                    <option key={place.id} value={place.id}>{place.name}</option>
                  ))}
                </select>
              </label>

              <label>
                Journey ID
                <input
                  type="number"
                  min="1"
                  placeholder="Optional"
                  value={form.journeyId}
                  onChange={(event) => setForm({ ...form, journeyId: event.target.value })}
                />
              </label>

              <label>
                Rating
                <select
                  value={form.rating}
                  onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>{rating} stars</option>
                  ))}
                </select>
              </label>

              <label>
                Comment
                <textarea
                  rows="5"
                  required
                  value={form.comment}
                  onChange={(event) => setForm({ ...form, comment: event.target.value })}
                  placeholder="How did the story, location trigger, or narration feel?"
                />
              </label>

              <button className="primary-btn full" type="submit" disabled={busy || !form.comment.trim()}>
                <Send size={18} />
                Submit feedback
              </button>
              {successMessage && <p className="success-text">{successMessage}</p>}
            </form>

            <section className="feedback-list">
              <h2>Recent feedback</h2>
              {feedback.length === 0 && <p className="muted">No feedback yet.</p>}
              {feedback.map((item) => (
                <article className="feedback-item" key={item.id}>
                  <div className="rating-row">
                    <Star size={18} />
                    <strong>{item.rating}/5</strong>
                  </div>
                  <p>{item.comment}</p>
                  <small><MessageSquare size={14} /> City #{item.cityId || "-"} - Place #{item.placeId || "-"}</small>
                </article>
              ))}
            </section>
          </section>
        )}
      </main>
    </>
  );
}

export default Feedback;

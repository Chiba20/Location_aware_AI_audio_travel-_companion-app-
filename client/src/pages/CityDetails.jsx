import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, ExternalLink, Headphones, Image, Info, LockKeyhole, MapPin, Pause, Play, Route, Sparkles, Video, WifiOff } from "lucide-react";
import Navbar from "../component/Navbar";
import LoadingState from "../component/LoadingState";
import ErrorState from "../component/ErrorState";
import { getCity } from "../services/api";
import content from "../data/appContent.json";

const kanchipuramHistory = {
  title: "History of Kanchipuram",
  intro:
    "Kanchipuram is one of South India's great ancient cities, remembered as a sacred centre, a royal capital, a place of learning, and a living home of silk, stone, and story.",
  knownFor: [
    "Ancient temple architecture shaped by Pallava, Chola, Vijayanagara, and later Tamil traditions",
    "A deep spiritual landscape where Shaiva and Vaishnava traditions exist side by side",
    "Kanchipuram silk sarees, known for rich colour, zari borders, and skilled handloom weaving",
    "Sacred learning, philosophy, ritual practice, inscriptions, and long-running festival culture"
  ],
  explore: [
    "Temple sculpture, gopurams, mandapams, and old stone corridors",
    "Silk weaving streets where craft families continue traditional methods",
    "Sacred tanks, old streets, markets, food stops, and hidden heritage corners",
    "Stories of kings, saints, artisans, pilgrims, and communities who shaped the city"
  ],
  stories: [
    "The Pallavas made Kanchipuram a powerful cultural centre, filling the region with temples, sculpture, and architectural experiments that influenced later South Indian design.",
    "The city became famous as a sacred landscape, with temples connected to devotion, myth, ritual, and the movement of pilgrims through narrow streets and temple courtyards.",
    "Kanchipuram's silk identity grew from generations of weavers who turned thread, colour, and gold zari into sarees worn for weddings, festivals, and major life moments.",
    "The city is often remembered as a place where religion, trade, craft, and learning met, making it more than a destination: it is a layered memory of Tamil civilisation."
  ]
};

const interestOverviews = {
  temples: {
    title: "Temple heritage",
    text: "Explore sacred spaces, old stone corridors, gopurams, mandapams, rituals, and stories that shaped Kanchipuram's spiritual identity.",
    facts: [
      { label: "Temple identity", value: "Traditionally known as the City of Thousand Temples" },
      { label: "Oldest landmark", value: "Kailasanathar Temple, a Pallava-era shrine from around the 7th-8th century" },
      { label: "Major temples", value: "Ekambareswarar, Kamakshi Amman, Varadharaja Perumal, Kailasanathar, Vaikunta Perumal" },
      { label: "Look for", value: "Tall gopurams, pillared halls, carved shrines, sacred tanks, inscriptions, and festival routes" }
    ],
    highlights: ["Pancha Bhoota Sthalam", "Divya Desam temples", "Pallava architecture"]
  },
  silk: {
    title: "Silk weaving streets",
    text: "Follow the craft behind Kanchipuram silk, from dyed threads and handlooms to sarees known for rich colour, zari, and family tradition.",
    highlights: ["Handloom craft", "Zari borders", "Weaver stories"]
  },
  architecture: {
    title: "Architecture and sculpture",
    text: "Look closely at the city's temple forms, carved pillars, sculpted details, and design ideas that influenced South Indian architecture.",
    highlights: ["Stone carvings", "Gopuram design", "Pallava influence"]
  },
  history: {
    title: "Layered city history",
    text: "Understand Kanchipuram as a royal, sacred, and craft-centred city where dynasties, saints, traders, and artisans left their mark.",
    highlights: ["Ancient dynasties", "Learning and devotion", "Living heritage"]
  },
  "hidden gems": {
    title: "Premium hidden gems",
    text: "Unlock a curated shortlist of five quieter Kanchipuram experiences: food spots, Sarvatirtha Tank, old residential streets, local markets, and walking routes.",
    highlights: ["Premium only", "Local food spots", "Walking routes"]
  },
  markets: {
    title: "Markets and local life",
    text: "Explore busy streets, local shopping, food culture, and everyday city rhythms that show how heritage continues in daily life.",
    highlights: ["Street life", "Local shopping", "City rhythm"]
  },
  culture: {
    title: "Culture and tradition",
    text: "Find rituals, festivals, food habits, craft practices, and community stories that give the city its living character.",
    highlights: ["Festivals", "Local customs", "Community stories"]
  }
};

const buildPlaceQuery = (place, cityName) => `${place.name} ${cityName || ""} Tamil Nadu India`.trim();

const buildPlaceLinks = (place, cityName) => {
  const query = buildPlaceQuery(place, cityName);
  const encodedQuery = encodeURIComponent(query);
  return {
    directions: place.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodedQuery}`,
    photos: place.photosUrl || `https://www.google.com/search?tbm=isch&q=${encodedQuery}`,
    videos: place.videosUrl || `https://www.youtube.com/results?search_query=${encodedQuery}+shorts`
  };
};

const requireOnline = (event) => {
  if (navigator.onLine) return;
  event.preventDefault();
  window.alert("This feature needs an internet connection. Live maps, photos, and videos cannot open offline.");
};

function CityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [hasPremium] = useState(() => Boolean(window.localStorage.getItem("everyStreetPremiumMember")));
  const [expandedInfoPlaceId, setExpandedInfoPlaceId] = useState(null);
  const [playingPlaceId, setPlayingPlaceId] = useState(null);
  const audioRef = useRef(null);
  const selectedInterest = searchParams.get("interest") || "all";

  const loadCity = () => {
    setLoading(true);
    setError("");
    getCity(id)
      .then((response) => setCity(response.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCity();
  }, [id]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const image = city ? content.heroImages[city.name] || content.heroImages.default : content.heroImages.default;

  const serviceCategories = useMemo(() => {
    const mainInterests = new Set((city?.interests || []).map((interest) => interest.toLowerCase()));
    const hiddenServiceCategories = new Set(["money transfer", "silk shop"]);
    const names = (city?.places || [])
      .filter((place) => place.category)
      .map((place) => place.category)
      .filter((categoryName) => {
        const normalized = categoryName.toLowerCase();
        return !mainInterests.has(normalized) && !hiddenServiceCategories.has(normalized);
      });
    return Array.from(new Set(names)).sort();
  }, [city]);

  const serviceCategorySet = useMemo(
    () => new Set(serviceCategories.map((categoryName) => categoryName.toLowerCase())),
    [serviceCategories]
  );

  const interestOptions = useMemo(() => ["all", ...(city?.interests || [])], [city]);

  const setInterest = (interest) => {
    setQuery("");
    if (interest === "all") {
      setSearchParams({});
      return;
    }
    setSearchParams({ interest });
  };

  const placeMatchesInterest = (place, interest) => {
    if (interest === "all") {
      return !place.category;
    }

    const target = interest.toLowerCase();
    const placeInterests = (place.interests || []).map((item) => item.toLowerCase());
    const category = (place.category || "").toLowerCase();
    const name = (place.name || "").toLowerCase();

    if (serviceCategorySet.has(target)) {
      return category === target;
    }

    if (target === "temples") {
      return name.includes("temple") || placeInterests.includes("spirituality");
    }

    if (target === "food") {
      return placeInterests.includes(target) || ["restaurant", "tea shop", "juice shop"].includes(category);
    }

    return placeInterests.includes(target) || category === target;
  };

  const togglePlaceInfo = (placeId) => {
    setExpandedInfoPlaceId((current) => (current === placeId ? null : placeId));
  };

  const togglePlaceAudio = (place) => {
    const audioUrl = place.audio?.url || place.audioUrl;
    if (!audioUrl) return;

    if (playingPlaceId === place.id && audioRef.current) {
      audioRef.current.pause();
      setPlayingPlaceId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.addEventListener("ended", () => setPlayingPlaceId(null), { once: true });
    audio.addEventListener("error", () => {
      setPlayingPlaceId(null);
      window.alert("This audio could not be played. Please check that the audio file exists.");
    }, { once: true });
    audio.play()
      .then(() => setPlayingPlaceId(place.id))
      .catch(() => {
        setPlayingPlaceId(null);
        window.alert("Tap again to allow audio playback in this browser.");
      });
  };

  const filteredPlaces = useMemo(() => {
    return (city?.places || []).filter((place) => {
      const text = [
        place.name,
        place.category,
        place.address,
        place.contact,
        place.timings,
        place.story,
        ...(place.interests || [])
      ].join(" ").toLowerCase();
      const matchesQuery = text.includes(query.toLowerCase());
      return matchesQuery && placeMatchesInterest(place, selectedInterest);
    });
  }, [city, query, selectedInterest, serviceCategorySet]);

  const normalizedInterest = selectedInterest.toLowerCase();
  const isKanchipuramHistory = city?.name === "Kanchipuram" && normalizedInterest === "history";
  const showPracticalDetails = serviceCategorySet.has(normalizedInterest);
  const showPlaceDetails = showPracticalDetails || ["temples", "silk", "architecture", "hidden gems"].includes(normalizedInterest);
  const selectedOverview = interestOverviews[normalizedInterest];
  const requiresPremium = normalizedInterest === "hidden gems" || serviceCategorySet.has(normalizedInterest);
  const isPremiumLocked = requiresPremium && !hasPremium;

  return (
    <>
      <Navbar />

      <div className="page-container">
        {loading && <LoadingState label="Loading city stories" />}
        {error && <ErrorState message={error} onRetry={loadCity} />}

        {!loading && !error && city && (
          <>
            <section className="city-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(24,58,55,.88), rgba(24,58,55,.32)), url(${image})` }}>
              <div>
                <span className="eyebrow">{city.state}, {city.country}</span>
                <h1>{city.name}</h1>
                <p>{city.description}</p>
                <div className="hero-actions">
                  <button
                    className="primary-btn"
                    type="button"
                    onClick={() => navigate("/journey", { state: { cityId: city.id, walkId: city.walks?.[0]?.id } })}
                  >
                    Start here
                    <ArrowRight size={18} />
                  </button>
                  <Link className="secondary-btn light" to="/cities">Back to cities</Link>
                </div>
              </div>
            </section>

            <section className="detail-layout">
              <div className="main-column">
                <div className="section-heading">
                  <h2>{selectedInterest === "all" ? "Important city interests" : selectedInterest}</h2>
                  <p>Select an interest to explore places that match your mood and journey.</p>
                </div>
                <div className="interest-button-row detail-toolbar" aria-label="City interest filters">
                  {interestOptions.map((interest) => (
                    <button
                      className={`chip interest-filter ${selectedInterest === interest ? "selected" : ""}`}
                      key={interest}
                      type="button"
                      onClick={() => setInterest(interest)}
                    >
                      {interest === "all" ? "Main places" : interest}
                    </button>
                  ))}
                </div>
                <div className="detail-search-row">
                  <input
                    aria-label="Search places"
                    placeholder="Search inside selected interest"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                {isPremiumLocked && (
                  <section className="premium-lock-panel">
                    <LockKeyhole size={28} />
                    <h3>{normalizedInterest === "hidden gems" ? "Hidden Gems are Premium" : "Traveller Services are Premium"}</h3>
                    <p>Register and login as a premium traveller to unlock this section.</p>
                    <Link className="primary-btn" to="/premium">Unlock Premium</Link>
                  </section>
                )}
                {!isPremiumLocked && selectedOverview && (
                  <section className="interest-overview">
                    <span className="eyebrow">Interest overview</span>
                    <h3>{selectedOverview.title}</h3>
                    <p>{selectedOverview.text}</p>
                    {selectedOverview.facts && (
                      <div className="overview-facts">
                        {selectedOverview.facts.map((fact) => (
                          <div key={fact.label}>
                            <strong>{fact.label}</strong>
                            <span>{fact.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="chip-row">
                      {selectedOverview.highlights.map((highlight) => (
                        <span className="mini-badge" key={highlight}>{highlight}</span>
                      ))}
                    </div>
                  </section>
                )}
                {!isPremiumLocked && isKanchipuramHistory && (
                  <section className="history-feature">
                    <span className="eyebrow">Ancient city story</span>
                    <h3>{kanchipuramHistory.title}</h3>
                    <p className="history-intro">{kanchipuramHistory.intro}</p>

                    <div className="history-columns">
                      <div>
                        <h4>What it is known for</h4>
                        <ul>
                          {kanchipuramHistory.knownFor.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4>What you can explore</h4>
                        <ul>
                          {kanchipuramHistory.explore.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="ancient-story-list">
                      {kanchipuramHistory.stories.map((story) => (
                        <article key={story}>
                          <Sparkles size={18} />
                          <p>{story}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
                {!isPremiumLocked && <div className="place-list">
                  {filteredPlaces.map((place) => (
                    (() => {
                      const links = buildPlaceLinks(place, city.name);
                      return (
                        <article className="place-card" key={place.id}>
                          <div className="place-icon">
                            <MapPin size={22} />
                          </div>
                          <div>
                            <div className="card-title-row">
                              <h3>{place.name}</h3>
                              {place.category && <span className="mini-badge">{place.category}</span>}
                              {place.isHiddenGem && <span className="mini-badge">Hidden gem</span>}
                            </div>
                            <p>{place.story}</p>
                            {showPlaceDetails && (place.address || place.contact || place.timings) && (
                              <div className="practical-grid">
                                {place.address && <span><strong>Address</strong>{place.address}</span>}
                                {place.contact && <span><strong>Contact</strong>{place.contact}</span>}
                                {place.timings && <span><strong>Timing</strong>{place.timings}</span>}
                              </div>
                            )}
                            <div className="meta-row">
                              <span><Headphones size={15} /> {place.audio?.durationSeconds || 0}s</span>
                              <span><Route size={15} /> {place.triggerRadius}m trigger</span>
                              {place.audio?.offlineAvailable && <span><WifiOff size={15} /> Offline</span>}
                            </div>
                            <div className="place-action-row" aria-label={`${place.name} links`}>
                              {place.audioNarration && (
                                <button type="button" onClick={() => togglePlaceInfo(place.id)}>
                                  <Info size={15} />
                                  {expandedInfoPlaceId === place.id ? "Hide info" : "Info"}
                                </button>
                              )}
                              {place.audioNarration && (place.audio?.url || place.audioUrl) && (
                                <button type="button" onClick={() => togglePlaceAudio(place)}>
                                  {playingPlaceId === place.id ? <Pause size={15} /> : <Play size={15} />}
                                  {playingPlaceId === place.id ? "Pause audio" : "Play audio"}
                                </button>
                              )}
                              <a href={links.directions} target="_blank" rel="noreferrer" onClick={requireOnline}>
                                <MapPin size={15} />
                                Directions
                                <ExternalLink size={13} />
                              </a>
                              <a href={links.photos} target="_blank" rel="noreferrer" onClick={requireOnline}>
                                <Image size={15} />
                                Photos
                                <ExternalLink size={13} />
                              </a>
                              <a href={links.videos} target="_blank" rel="noreferrer" onClick={requireOnline}>
                                <Video size={15} />
                                Videos
                                <ExternalLink size={13} />
                              </a>
                            </div>
                            {expandedInfoPlaceId === place.id && place.audioNarration && (
                              <div className="audio-info-panel">
                                <strong>Audio story text</strong>
                                <p>{place.audioNarration}</p>
                                {place.audioSources?.length > 0 && (
                                  <div className="source-list">
                                    {place.audioSources.map((source, index) => (
                                      <a href={source} target="_blank" rel="noreferrer" key={source}>
                                        Source {index + 1}
                                        <ExternalLink size={13} />
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            <p className="did-you-know"><Sparkles size={16} /> {place.didYouKnow}</p>
                          </div>
                        </article>
                      );
                    })()
                  ))}
                  {filteredPlaces.length === 0 && (
                    <div className="state-panel">
                      <p>No places match this interest yet.</p>
                    </div>
                  )}
                </div>}
              </div>

              <aside className="side-panel">
                <h2>Traveller services</h2>
                <p className="muted">Premium-only local services for practical travel help.</p>
                <div className="service-button-grid">
                  {serviceCategories.map((service) => (
                    <button
                      className={`chip service-chip ${selectedInterest === service ? "selected" : ""}`}
                      key={service}
                      type="button"
                      onClick={() => setInterest(service)}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </aside>
            </section>
          </>
        )}
      </div>
    </>
  );
}

export default CityDetails;

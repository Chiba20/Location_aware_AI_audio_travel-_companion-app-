import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, Building2, ChevronLeft, ChevronRight, Compass, ExternalLink, EyeOff, Gem, Headphones, Image, Info, Landmark, LockKeyhole, MapPin, Pause, Play, Route, ScrollText, Sparkles, Store, Utensils, Video, WandSparkles, WifiOff } from "lucide-react";
import Navbar from "../component/Navbar";
import LoadingState from "../component/LoadingState";
import ErrorState from "../component/ErrorState";
import { generatePersonalizedStory, getCity } from "../services/api";
import { recordMetric } from "../utils/metrics";
import content from "../data/appContent.json";


const kanchipuramHistory = {
  title: "History of Kanchipuram",
  intro:
    "Kanchipuram is one of South India's great ancient cities: a Pallava capital, a centre of Tamil and Sanskrit learning, a sacred city of Shaiva and Vaishnava traditions, and a living home of silk, stone, and story.",
  knownFor: [
    "A Pallava royal capital that helped shape the political and artistic history of northern Tamil Nadu",
    "Sacred geography where Shaiva, Vaishnava, Jain, and Buddhist memories once met across the city",
    "Temple architecture that records Pallava, Chola, and Vijayanagara layers in stone, sculpture, gateways, and halls",
    "Silk weaving traditions that grew with royal patronage, temple culture, trade, and hereditary craft communities"
  ],
  explore: [
    "How Pallava rulers turned Kanchi into a capital of architecture, inscriptions, learning, and sacred authority",
    "How temple streets, tanks, mandapas, and gateways made ritual movement part of the city plan",
    "How silk weaving became part of Kanchipuram's identity through skilled communities and ceremonial demand",
    "How kings, saints, scholars, artisans, pilgrims, and traders all left different kinds of history behind"
  ],
  stories: [
    "Kanchipuram's historical power comes from the way it joined kingship and sacred space. Under the Pallavas, Kanchi was not just a ruling centre; it became a place where royal ambition was carved into durable stone, where Sanskrit and Tamil learning flourished, and where sacred institutions helped the city speak across centuries.",
    "Its temples should be read as historical records as much as religious monuments. Their towers, mandapas, shrines, inscriptions, sculpted panels, sacred tanks, and processional streets show how dynasties, patrons, artists, and communities kept adding to the city rather than replacing it.",
    "The city's silk story belongs to the same long history. Kanchipuram sarees carry memory through colour, zari, borders, and motifs shaped by temple forms and ceremonial life. The craft is not separate from heritage; it is one of the ways Kanchipuram's past is still worn, gifted, and remembered.",
    "That is why the city feels layered instead of frozen. A traveller can move from stone corridors to weaving streets, from old markets to sacred tanks, from Pallava architecture to later festival traditions, and still be inside one continuing story of Tamil civilisation."
  ]
};

const kanchipuramHistoryLinks = [
  {
    label: "City history",
    url: "https://www.worldhistory.org/Kanchipuram/"
  },
  {
    label: "Pallava dynasty",
    url: "https://www.britannica.com/topic/Pallava-dynasty"
  },
  {
    label: "Temples and silk",
    url: "https://artsandculture.google.com/story/kanchipuram-the-city-of-temples-and-silk/GwURg_BDf2ZpLw?hl=en"
  }
];

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
    text: "Read the built form itself: Pallava sandstone experiments, Dravidian vimanas, cloistered corridors, lion-base pillars, sculpted wall panels, and later gateway and mandapa additions.",
    facts: [
      { label: "Core style", value: "Early Dravidian temple architecture shaped by Pallava builders and later expanded by Chola and Vijayanagara traditions" },
      { label: "Materials", value: "Granite plinths support lighter sandstone superstructures, allowing rich carving while stabilising the monument" },
      { label: "Look for", value: "Pyramidal vimanas, mandapas, prakara walls, miniature shrine forms, lion-base pillars, carved panels, inscriptions, and murals" },
      { label: "Best examples", value: "Kailasanathar Temple and Vaikunta Perumal Temple show Pallava planning, sculpture, and narrative architecture most clearly" }
    ],
    highlights: ["Pallava sandstone", "Dravidian vimana", "Lion-base pillars"]
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

const interestMeta = {
  all: {
    label: "Main places",
    title: "Start with the landmarks",
    text: "Begin with the city's core story stops before narrowing into a theme.",
    icon: Compass
  },
  temples: {
    label: "Temples",
    title: "Sacred routes",
    text: "Temple corridors, rituals, legends, and sacred architecture.",
    icon: Landmark
  },
  silk: {
    label: "Silk",
    title: "Weaving streets",
    text: "Handloom craft, saree shops, zari work, and artisan memory.",
    icon: Sparkles
  },
  architecture: {
    label: "Architecture",
    title: "Stone and structure",
    text: "Gopurams, carved pillars, shrines, and old-town forms.",
    icon: Building2
  },
  history: {
    label: "History",
    title: "Layered past",
    text: "Dynasties, saints, learning traditions, and civic memory.",
    icon: ScrollText
  },
  "hidden gems": {
    label: "Hidden gems",
    title: "Quieter discoveries",
    text: "Local lanes, tanks, food corners, and premium route ideas.",
    icon: Gem
  },
  markets: {
    label: "Markets",
    title: "Street life",
    text: "Bazaars, local shopping, food stops, and daily rhythms.",
    icon: Store
  },
  culture: {
    label: "Culture",
    title: "Living tradition",
    text: "Festivals, rituals, community stories, and local customs.",
    icon: Sparkles
  },
  food: {
    label: "Food",
    title: "Food trails",
    text: "Tiffin shops, snacks, drinks, and late-night city flavour.",
    icon: Utensils
  }
};

const interestPlaceLabels = {
  temples: "temple",
  silk: "silk shop",
  architecture: "architecture place",
  history: "history place",
  "hidden gems": "hidden gem",
  markets: "market",
  culture: "culture place",
  food: "food place"
};

const architectureDetails = [
  {
    title: "Pallava stone experiment",
    text: "Kanchipuram architecture is important because it shows the move from rock-cut sacred spaces toward freestanding structural temples. Kailasanathar is especially useful to study: a granite base supports sandstone walls, shrines, and sculpted surfaces, turning architecture into a stable but highly carved composition."
  },
  {
    title: "Vimana, mandapa, and enclosure",
    text: "Instead of seeing each site only as a temple name, look at its parts. The vimana rises above the sanctum in stacked, tapering tiers. Mandapas create ritual and gathering space. Prakara walls and cloisters frame movement, shade, sculpture, and circumambulation."
  },
  {
    title: "Sculpture as structure",
    text: "The architecture is not plain masonry with decoration added later. Pillars, pilasters, shrine niches, lion bases, narrative panels, and deity figures are part of how the wall is read. Vaikunta Perumal is known for cloister panels that turn dynastic history into carved visual storytelling."
  }
];

const architectureSources = [
  {
    label: "Kailasanathar architecture notes",
    url: "https://imp-art.org/articles/kailasanathar-temple-kanchipuram/"
  },
  {
    label: "UNESCO tentative listing",
    url: "https://whc.unesco.org/fr/listesindicatives/6528/"
  },
  {
    label: "Architecture photo search",
    url: "https://www.google.com/search?tbm=isch&q=Kanchipuram+Pallava+temple+architecture"
  }
];

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
  const [storyStyle, setStoryStyle] = useState("warm");
  const [personalizedStory, setPersonalizedStory] = useState("");
  const [storySource, setStorySource] = useState("");
  const [storyBusy, setStoryBusy] = useState(false);
  const [storyError, setStoryError] = useState("");
  const [microStoryIndex, setMicroStoryIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [hasPremium] = useState(() => {
    const savedPremium = window.localStorage.getItem("everyStreetPremiumMember");
    return savedPremium ? JSON.parse(savedPremium)?.isPremium === true : false;
  });
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
    const nonServiceCategories = new Set(["hidden gem", "money transfer", "silk shop", "temple"]);
    const names = (city?.places || [])
      .filter((place) => place.category)
      .map((place) => place.category)
      .filter((categoryName) => {
        const normalized = categoryName.toLowerCase();
        return !mainInterests.has(normalized) && !nonServiceCategories.has(normalized);
      });
    return Array.from(new Set(names)).sort();
  }, [city]);

  const serviceCategorySet = useMemo(
    () => new Set(serviceCategories.map((categoryName) => categoryName.toLowerCase())),
    [serviceCategories]
  );

  const interestOptions = useMemo(() => city?.interests || [], [city]);

  const setInterest = (interest) => {
    setQuery("");
    recordMetric("interest_select", { cityId: id, interest });
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

  const interestCards = useMemo(() => {
    return interestOptions.map((interest) => {
      const normalized = interest.toLowerCase();
      const matches = (city?.places || []).filter((place) => placeMatchesInterest(place, interest));
      const meta = interestMeta[normalized] || {
        label: interest,
        title: interest,
        text: "Local places and stories connected to this interest.",
        icon: MapPin
      };

      return {
        interest,
        ...meta,
        count: matches.length,
        preview: matches.slice(0, 3).map((place) => place.name)
      };
    });
  }, [city, interestOptions, serviceCategorySet]);

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
  const isHistoryInterest = normalizedInterest === "history";
  const isArchitectureInterest = normalizedInterest === "architecture";
  const showPracticalDetails = serviceCategorySet.has(normalizedInterest);
  const showPlaceDetails = showPracticalDetails || ["temples", "silk", "architecture", "hidden gems"].includes(normalizedInterest);
  const selectedOverview = interestOverviews[normalizedInterest];
  const selectedInterestCard = interestCards.find((card) => card.interest === selectedInterest);
  const selectedPlaceLabel = interestPlaceLabels[normalizedInterest] || selectedInterest;
  const searchPlaceholder = selectedInterest === "all"
    ? "Search for a place"
    : `Search for a ${selectedPlaceLabel}`;
  const requiresPremium = normalizedInterest === "hidden gems" || serviceCategorySet.has(normalizedInterest);
  const isPremiumLocked = requiresPremium && !hasPremium;
  const microStories = useMemo(
    () => filteredPlaces
      .filter((place) => place.didYouKnow)
      .map((place) => ({
        id: place.id,
        title: place.name,
        text: place.didYouKnow,
        durationSeconds: place.audio?.durationSeconds || 0,
      })),
    [filteredPlaces]
  );

  useEffect(() => {
    setMicroStoryIndex(0);
    setPersonalizedStory("");
    setStoryError("");
  }, [selectedInterest, query]);

  const moveMicroStory = (direction) => {
    if (!microStories.length) return;
    setMicroStoryIndex((current) => {
      const next = (current + direction + microStories.length) % microStories.length;
      recordMetric("micro_story_swipe", {
        cityId: city?.id,
        interest: selectedInterest,
        storyId: microStories[next]?.id,
      });
      return next;
    });
  };

  const handleTouchEnd = (event) => {
    if (touchStartX === null) return;
    const delta = touchStartX - event.changedTouches[0].clientX;
    setTouchStartX(null);
    if (Math.abs(delta) < 40) return;
    moveMicroStory(delta > 0 ? 1 : -1);
  };

  const handlePersonalizedStory = async () => {
    setStoryBusy(true);
    setStoryError("");
    try {
      const response = await generatePersonalizedStory({
        cityName: city.name,
        interest: selectedInterest === "all" ? "main places" : selectedInterest,
        narrationStyle: storyStyle,
        places: filteredPlaces.slice(0, 8).map((place) => ({
          name: place.name,
          story: place.story,
          didYouKnow: place.didYouKnow,
          category: place.category,
        })),
      });
      setPersonalizedStory(response.data.story);
      setStorySource(response.data.source);
      recordMetric("ai_story_generated", {
        cityId: city.id,
        interest: selectedInterest,
        source: response.data.source,
      });
    } catch (err) {
      setStoryError(err.message);
    } finally {
      setStoryBusy(false);
    }
  };

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

            <section className="detail-layout interest-detail-layout">
              <div className="main-column">
                <div className="interest-service-row">
                  <section className="interest-picker-panel">
                    <div className="section-heading">
                      <h2>Choose your travel interest</h2>
                      <p>Pick what you want to explore and the city will show matching stories.</p>
                    </div>
                    <div className="interest-view-grid detail-toolbar" aria-label="City interest views">
                      {interestCards.map((card) => {
                        const InterestIcon = card.icon;
                        return (
                        <button
                          className={`interest-view-card ${selectedInterest === card.interest ? "selected" : ""}`}
                          key={card.interest}
                          type="button"
                          onClick={() => setInterest(card.interest)}
                        >
                          <span className="interest-view-icon" aria-hidden="true">
                            <InterestIcon size={18} strokeWidth={2.3} />
                          </span>
                          <span className="interest-view-copy">
                            <strong>{card.label}</strong>
                          </span>
                          {card.preview.length > 0 && (
                            <span className="interest-view-preview">{card.preview.join(" - ")}</span>
                          )}
                        </button>
                        );
                      })}
                    </div>
                  </section>

                  {!isPremiumLocked && (
                    <section className="traveller-services-panel">
                      <div className="section-heading">
                        <h2>Traveller services</h2>
                        <p>Premium-only local services for practical travel help.</p>
                      </div>
                      <div className="service-card-grid">
                        {serviceCategories.length > 0 ? serviceCategories.map((service) => (
                          <button
                            className={`service-option-card ${selectedInterest === service ? "selected" : ""}`}
                            key={service}
                            type="button"
                            onClick={() => setInterest(service)}
                          >
                            <span>
                              <strong>{service}</strong>
                            </span>
                          </button>
                        )) : (
                          <div className="service-empty-card">
                            <Store size={20} />
                            <span>No services listed yet</span>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </div>
                {isPremiumLocked && (
                  <section className="premium-lock-panel">
                    <LockKeyhole size={28} />
                    <h3>{normalizedInterest === "hidden gems" ? "Hidden Gems are Premium" : "Traveller Services are Premium"}</h3>
                    <p>Register and login as a premium traveller to unlock this section.</p>
                    <Link className="primary-btn" to="/premium">Unlock Premium</Link>
                  </section>
                )}
                {!isPremiumLocked && selectedInterestCard && (
                  <section className="interest-overview">
                    <h3>{selectedOverview?.title || selectedInterestCard.title}</h3>
                    <p>{selectedOverview?.text || selectedInterestCard.text}</p>
                    {selectedOverview?.facts && (
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
                      {(selectedOverview?.highlights || selectedInterestCard.preview).map((highlight) => (
                        <span className="mini-badge" key={highlight}>{highlight}</span>
                      ))}
                    </div>
                    {isArchitectureInterest && (
                      <>
                        <div className="architecture-detail-grid">
                          {architectureDetails.map((detail) => (
                            <article key={detail.title}>
                              <Building2 size={18} />
                              <div>
                                <h4>{detail.title}</h4>
                                <p>{detail.text}</p>
                              </div>
                            </article>
                          ))}
                        </div>
                        <div className="architecture-source-row">
                          {architectureSources.map((source) => (
                            <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                              {source.label}
                              <ExternalLink size={13} />
                            </a>
                          ))}
                        </div>
                      </>
                    )}
                  </section>
                )}
                {!isPremiumLocked && microStories.length > 0 && (
                  <section
                    className="micro-story-carousel"
                    onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
                    onTouchEnd={handleTouchEnd}
                    aria-label="Swipeable Did You Know micro-stories"
                  >
                    <div className="micro-story-top">
                      <div>
                        <span className="eyebrow">Did You Know</span>
                        <h3>Swipe micro-stories</h3>
                      </div>
                      <span>{microStoryIndex + 1}/{microStories.length}</span>
                    </div>
                    <article className="micro-story-card">
                      <strong>{microStories[microStoryIndex].title}</strong>
                      <p>{microStories[microStoryIndex].text}</p>
                    </article>
                    <div className="micro-story-actions">
                      <button type="button" onClick={() => moveMicroStory(-1)} aria-label="Previous micro-story">
                        <ChevronLeft size={18} />
                      </button>
                      <div className="micro-story-dots" aria-hidden="true">
                        {microStories.map((story, index) => (
                          <span className={index === microStoryIndex ? "active" : ""} key={story.id} />
                        ))}
                      </div>
                      <button type="button" onClick={() => moveMicroStory(1)} aria-label="Next micro-story">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </section>
                )}
                {!isPremiumLocked && (
                  <section className="personal-story-panel">
                    <div>
                      <span className="eyebrow">True AI personalization</span>
                      <h3>Personalized city story</h3>
                      <p>Generate a story from the selected interest and visible place content.</p>
                    </div>
                    <div className="story-controls">
                      <label>
                        Narration style
                        <select value={storyStyle} onChange={(event) => setStoryStyle(event.target.value)}>
                          <option value="warm">Warm traveller</option>
                          <option value="historical">Historical guide</option>
                          <option value="short and cinematic">Short cinematic</option>
                          <option value="family friendly">Family friendly</option>
                        </select>
                      </label>
                      <button className="primary-btn" type="button" onClick={handlePersonalizedStory} disabled={storyBusy || filteredPlaces.length === 0}>
                        <WandSparkles size={18} />
                        {storyBusy ? "Generating" : "Generate story"}
                      </button>
                    </div>
                    {storyError && <p className="premium-message">{storyError}</p>}
                    {personalizedStory && (
                      <article className="personal-story-output">
                        <div className="personal-story-output-top">
                          <span>{storySource === "ai" ? "AI generated" : "Generated from app content"}</span>
                          <button type="button" onClick={() => setPersonalizedStory("")}>
                            <EyeOff size={15} />
                            Hide
                          </button>
                        </div>
                        <p>{personalizedStory}</p>
                      </article>
                    )}
                  </section>
                )}
                {!isPremiumLocked && isKanchipuramHistory && (
                  <section className="history-feature">
                    <h3>{kanchipuramHistory.title}</h3>
                    <p className="history-intro">{kanchipuramHistory.intro}</p>
                    <div className="history-source-row">
                      {kanchipuramHistoryLinks.map((link) => (
                        <a href={link.url} target="_blank" rel="noreferrer" key={link.url}>
                          {link.label}
                          <ExternalLink size={13} />
                        </a>
                      ))}
                    </div>

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

                    <div className="ancient-story-list history-story-list">
                      {kanchipuramHistory.stories.map((story) => (
                        <article key={story}>
                          <Sparkles size={18} />
                          <p>{story}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
                {!isPremiumLocked && !isHistoryInterest && (
                  <section className="places-section-card">
                    <div className="section-heading">
                      <h2>{searchPlaceholder}</h2>
                      <p>Explore memorable places and stories matched to your selected interest.</p>
                    </div>
                    <div className="detail-search-row">
                      <input
                        aria-label="Search places"
                        placeholder={searchPlaceholder}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                      />
                    </div>
                  </section>
                )}
                {!isPremiumLocked && !isHistoryInterest && <div className="place-list">
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
                            {!isHistoryInterest && <div className="place-action-row" aria-label={`${place.name} links`}>
                              {!isArchitectureInterest && place.audioNarration && (
                                <button type="button" onClick={() => togglePlaceInfo(place.id)}>
                                  <Info size={15} />
                                  {expandedInfoPlaceId === place.id ? "Hide info" : "Info"}
                                </button>
                              )}
                              {!isArchitectureInterest && place.audioNarration && (place.audio?.url || place.audioUrl) && (
                                <button type="button" onClick={() => togglePlaceAudio(place)}>
                                  {playingPlaceId === place.id ? <Pause size={15} /> : <Play size={15} />}
                                  {playingPlaceId === place.id ? "Pause audio" : "Play audio"}
                                </button>
                              )}
                              {!isArchitectureInterest && <a href={links.directions} target="_blank" rel="noreferrer" onClick={(event) => {
                                requireOnline(event);
                                recordMetric("media_open", { cityId: city.id, placeId: place.id, type: "directions" });
                              }}>
                                <MapPin size={15} />
                                Directions
                                <ExternalLink size={13} />
                              </a>}
                              <a href={links.photos} target="_blank" rel="noreferrer" onClick={(event) => {
                                requireOnline(event);
                                recordMetric("media_open", { cityId: city.id, placeId: place.id, type: "photos" });
                              }}>
                                <Image size={15} />
                                {isArchitectureInterest ? "View architecture photos" : "Photos"}
                                <ExternalLink size={13} />
                              </a>
                              {!isArchitectureInterest && <a href={links.videos} target="_blank" rel="noreferrer" onClick={(event) => {
                                requireOnline(event);
                                recordMetric("media_open", { cityId: city.id, placeId: place.id, type: "videos" });
                              }}>
                                <Video size={15} />
                                Videos
                                <ExternalLink size={13} />
                              </a>}
                            </div>}
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
            </section>
          </>
        )}
      </div>
    </>
  );
}

export default CityDetails;

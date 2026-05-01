import { useEffect, useMemo, useRef, useState } from "react";
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
    text: "See Kanchipuram through stone, shade, towers, corridors, and sculpted walls. These places are worth visiting because their architecture is not still or silent: it guides walking, frames worship, catches light, and turns history into something you can stand inside.",
    facts: [
      { label: "Why go", value: "To feel how temple design controls scale, movement, light, silence, procession, and attention" },
      { label: "Look closely", value: "Vimanas, mandapas, prakara walls, miniature shrine forms, lion-base pillars, carved panels, inscriptions, and mural traces" },
      { label: "Best first stop", value: "Kailasanathar Temple for early Pallava stonework and a quieter, close-looking architecture experience" },
      { label: "Best grand scale", value: "Ekambareswarar Temple for gateways, courtyards, processional space, and the feeling of a temple as a living city" }
    ],
    highlights: ["Pallava sandstone", "Dravidian vimana", "Lion-base pillars", "Narrative walls"]
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
    title: "Walk before you judge",
    text: "Do not only stand at the entrance for a photograph. Move slowly through the base, wall, shrine, tower, corridor, and gateway. The architecture becomes clearer when your body follows the route it was designed for."
  },
  {
    title: "Notice the change in mood",
    text: "Kailasanathar feels compact and ancient, Vaikunta Perumal feels layered and narrative, and Ekambareswarar feels large and public. Visiting more than one place helps you feel how Kanchipuram architecture changes personality."
  },
  {
    title: "Let the carvings slow you down",
    text: "Pillars, pilasters, niches, deity figures, inscriptions, and panels are not decoration added at the end. They tell you where to pause, where to look up, and how sacred meaning was built into the wall itself."
  }
];

const architectureReadingTips = [
  "Look up at the vimana above the sanctum, not only at the entrance tower.",
  "Watch how shade, corridors, and enclosure change the pace of walking.",
  "Compare one detail at every stop: pillars, niches, panels, or tower form."
];

const architectureShowcase = [
  {
    title: "Kailasanathar Temple",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Kailasanathar_Temple_-_Kanchipuram.jpg?width=900",
    imageLink: "https://commons.wikimedia.org/wiki/Special:FilePath/Kailasanathar_Temple_-_Kanchipuram.jpg",
    focus: "Quiet Pallava stonework",
    mood: "Best for slow looking",
    text: "Go here when you want architecture close enough to read with your eyes. The compact plan, sandstone surfaces, small shrine forms, and carved walls make the temple feel like an early stone notebook of Dravidian design.",
    lookFor: "Sandstone walls, miniature shrines, lion-base pillars, sculpted niches"
  },
  {
    title: "Vaikunta Perumal Temple",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Vaikunta_perumal_temple%2C_Kanchipuram.JPG?width=900",
    imageLink: "https://commons.wikimedia.org/wiki/Special:FilePath/Vaikunta_perumal_temple%2C_Kanchipuram.JPG",
    focus: "Story carved into movement",
    mood: "Best for history lovers",
    text: "Visit this one when you want architecture to feel like a story path. The enclosure, inner movement, and sculptural panels make the building more than a shrine: it becomes a place where Pallava memory and worship meet.",
    lookFor: "Layered plan, enclosed movement, narrative panels, royal memory"
  },
  {
    title: "Ekambareswarar Temple",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Ekambareswarar%20temple%20kanchipuram.jpg?width=900",
    imageLink: "https://commons.wikimedia.org/wiki/Special:FilePath/Ekambareswarar%20temple%20kanchipuram.jpg",
    focus: "Grand temple-city scale",
    mood: "Best for first-time visitors",
    text: "Choose this stop when you want the full force of a living temple town. Large gateways, courtyards, temple streets, and pillared spaces show how architecture can hold worship, movement, legend, and city life together.",
    lookFor: "Tall gopuram, courtyards, processional space, pillared halls"
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

const formatDidYouKnowFact = (title, text) => {
  const cleaned = String(text || "")
    .trim()
    .replace(/^it is\s+/i, "is ")
    .replace(/^it was\s+/i, "was ")
    .replace(/^the temple is\s+/i, "is ")
    .replace(/^the complex is\s+/i, "is ")
    .replace(/^the shrine is\s+/i, "is ");
  return `Did you know ${title} ${cleaned}`;
};

const getInterestDidYouKnowFact = (place, interest) => {
  const normalized = interest.toLowerCase();
  const name = (place.name || "").toLowerCase();

  if (normalized === "architecture") {
    if (name.includes("ekambareswarar")) {
      return "shows how gateways, courtyards, pillared spaces, and temple streets turn a sacred site into part of the city plan.";
    }
    if (name.includes("kailasanathar")) {
      return "is often highlighted as one of the oldest surviving structural temples in Kanchipuram, making it a key stop for early Dravidian architecture.";
    }
    if (name.includes("vaikunta")) {
      return "uses planned movement, enclosure, and sculptural panels to connect Pallava royal memory with sacred architecture.";
    }
    if (name.includes("varadharaja")) {
      return "is useful for reading later temple scale through prakarams, pillared halls, sacred tanks, and processional spaces.";
    }
    return "helps reveal Kanchipuram through built details such as shrine layout, tower form, carved panels, enclosure, material, and movement.";
  }

  if (normalized === "temples") {
    if (name.includes("ekambareswarar")) {
      return "is one of the Pancha Bhoota Sthalams, associated with the element earth.";
    }
    if (name.includes("kamakshi")) {
      return "is closely associated with the goddess Kamakshi, one of the most revered forms of Devi in Tamil tradition.";
    }
    if (name.includes("varadharaja")) {
      return "is famous for the Athi Varadar festival, when the wooden image of the deity is brought out after long intervals.";
    }
    return place.didYouKnow;
  }

  if (normalized === "silk") {
    if (name.includes("weaver")) {
      return "can reveal how dyed thread, loom setup, borders, zari, and patient handwork become a finished Kanchipuram saree.";
    }
    if (name.includes("rmkv")) {
      return "connects Kanchipuram silk shopping with checks such as Silk Mark and zari purity information.";
    }
    return place.didYouKnow;
  }

  if (normalized === "history") {
    if (name.includes("kailasanathar")) {
      return "preserves Pallava-period memory in stone, making it one of the clearest historical markers in the city.";
    }
    if (name.includes("kanchi kudil")) {
      return "helps explain old-town domestic life through traditional interiors, household objects, and street-house design.";
    }
    return place.didYouKnow;
  }

  if (normalized === "hidden gems") {
    if (name.includes("sarvatirtha")) {
      return "shows how temple tanks could act as sacred, social, and environmental spaces in older South Indian towns.";
    }
    if (name.includes("walking")) {
      return "reveals connections between temples, lanes, markets, food stops, and quiet corners that are easy to miss by vehicle.";
    }
    return place.didYouKnow;
  }

  if (normalized === "food") {
    return place.didYouKnow || "is best understood through timing, local freshness, and the daily rhythm of people eating nearby.";
  }

  if (normalized === "markets") {
    return place.didYouKnow || "shows how shopping, pilgrimage, food, services, and everyday city movement overlap in one place.";
  }

  if (normalized === "culture") {
    return place.didYouKnow || "connects local practice, memory, worship, craft, and everyday routines into one living city experience.";
  }

  return place.didYouKnow;
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
  const interestExplanationLabel = selectedInterest === "all"
    ? "Why this place matters"
    : `Why this matches ${selectedPlaceLabel}`;
  const getInterestSpecificExplanation = (place) => {
    if (normalizedInterest === "architecture") {
      const name = (place.name || "").toLowerCase();
      if (name.includes("kailasanathar")) {
        return "This stop is one of the clearest places to study Pallava structural temple design: a raised base, compact shrine plan, sandstone carving, miniature shrines, and sculpted wall surfaces all work together.";
      }
      if (name.includes("vaikunta")) {
        return "This stop is useful for reading architecture as visual history. Its planned enclosure, layered movement, and narrative panels help show how royal memory and sacred design were built into stone.";
      }
      if (name.includes("ekambareswarar")) {
        return "This stop shows architectural scale: large gateways, processional space, pillared areas, and later expansions help explain how Kanchipuram temples grew across dynasties.";
      }
      return "For the architecture interest, focus on the built details: tower form, shrine layout, pillar rhythm, wall niches, enclosure, material, sculptural panels, and how the place guides movement.";
    }

    if (normalizedInterest === "temples") {
      return "This place connects to worship, sacred geography, ritual movement, and temple-town memory, making it relevant for travellers exploring Kanchipuram's spiritual identity.";
    }
    if (normalizedInterest === "silk") {
      return "This place links the trip to Kanchipuram's living textile economy: handloom skill, saree buying, craft reputation, family occasions, and local shopping streets.";
    }
    if (normalizedInterest === "history") {
      return "This place helps explain the city's layered past through dynasties, sacred institutions, local memory, craft traditions, and everyday heritage.";
    }
    if (normalizedInterest === "hidden gems") {
      return "This stop fits the hidden-gem interest because it reveals quieter local life beyond the famous landmarks: food, lanes, tanks, markets, or slower walking routes.";
    }
    if (normalizedInterest === "markets" || normalizedInterest === "food") {
      return "This place fits the selected interest because it shows daily city rhythm through shopping, food, movement, small stops, and practical local discovery.";
    }
    if (normalizedInterest === "culture") {
      return "This place connects to living culture: rituals, habits, community spaces, food, craft, festivals, and the ordinary routines that keep the city active.";
    }
    return "This place is part of the city's main travel story and gives the visitor a clear starting point before choosing a deeper theme.";
  };
  const requiresPremium = normalizedInterest === "hidden gems" || serviceCategorySet.has(normalizedInterest);
  const isPremiumLocked = requiresPremium && !hasPremium;
  const microStories = useMemo(() => {
    const seenFacts = new Set();
    return filteredPlaces.reduce((stories, place) => {
      const fact = getInterestDidYouKnowFact(place, selectedInterest);
      if (!fact) return stories;

      const fullText = formatDidYouKnowFact(place.name, fact);
      const normalizedFact = fullText.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      if (seenFacts.has(normalizedFact)) return stories;
      seenFacts.add(normalizedFact);

      stories.push({
        id: place.id,
        title: place.name,
        text: fact,
        fullText,
        durationSeconds: place.audio?.durationSeconds || 0,
      });
      return stories;
    }, []);
  }, [filteredPlaces, selectedInterest]);
  const microStorySlideCount = microStories.length + 1;
  const activeMicroStory = microStories[microStoryIndex - 1];

  useEffect(() => {
    setMicroStoryIndex(0);
    setPersonalizedStory("");
    setStoryError("");
  }, [selectedInterest, query]);

  const moveMicroStory = (direction) => {
    if (!microStories.length) return;
    setMicroStoryIndex((current) => {
      const next = (current + direction + microStorySlideCount) % microStorySlideCount;
      recordMetric("micro_story_swipe", {
        cityId: city?.id,
        interest: selectedInterest,
        storyId: microStories[next - 1]?.id,
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
        referenceNotes: isKanchipuramHistory ? {
          intro: kanchipuramHistory.intro,
          knownFor: kanchipuramHistory.knownFor,
          explore: kanchipuramHistory.explore,
          stories: kanchipuramHistory.stories
        } : null,
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
                        <div className="architecture-read-card">
                          <Building2 size={24} />
                          <div>
                            <strong>Architecture mode</strong>
                            <p>Use this section to observe form, material, movement, and carved meaning. The goal is to understand how each temple is built, not only what it is called.</p>
                          </div>
                        </div>
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
                        <div className="architecture-tip-row">
                          {architectureReadingTips.map((tip) => (
                            <span key={tip}>{tip}</span>
                          ))}
                        </div>
                        <div className="architecture-image-grid" aria-label="Architecture examples">
                          {architectureShowcase.map((item) => (
                            <article className="architecture-image-card" key={item.title}>
                              <a className="architecture-photo-link" href={item.imageLink} target="_blank" rel="noreferrer" onClick={requireOnline} aria-label={`Open ${item.title} architecture picture`}>
                                <img src={item.image} alt={`${item.title} architecture`} loading="lazy" />
                                <span>{item.mood}</span>
                              </a>
                              <div className="architecture-image-content">
                                <span className="architecture-focus">{item.focus}</span>
                                <h4>{item.title}</h4>
                                <p>{item.text}</p>
                                <strong>Look for: {item.lookFor}</strong>
                                <a href={item.imageLink} target="_blank" rel="noreferrer" onClick={requireOnline}>
                                  Open picture
                                  <ExternalLink size={13} />
                                </a>
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
                    className="micro-story-carousel did-you-know-intro"
                    onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
                    onTouchEnd={handleTouchEnd}
                    aria-label="Swipeable Did You Know micro-stories"
                  >
                    <article className="micro-story-card">
                      {microStoryIndex === 0 ? (
                        <strong className="did-you-know-question">Did you know?</strong>
                      ) : (
                        <p>{activeMicroStory.fullText}</p>
                      )}
                    </article>
                    <div className="micro-story-actions">
                      <button type="button" onClick={() => moveMicroStory(-1)} aria-label="Previous micro-story">
                        <ChevronLeft size={18} />
                      </button>
                      <div className="micro-story-dots" aria-hidden="true">
                        {Array.from({ length: microStorySlideCount }).map((_, index) => (
                          <span className={index === microStoryIndex ? "active" : ""} key={index} />
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
                      <span className="eyebrow">Personalized narration</span>
                      <h3>Personalized city story</h3>
                      <p>Generate a fresh story from the selected interest and visible place facts.</p>
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
                          <span>{storySource === "ai" ? "AI generated from place facts" : "Generated from place facts"}</span>
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
                {!isPremiumLocked && !isHistoryInterest && !isArchitectureInterest && (
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
                {!isPremiumLocked && !isHistoryInterest && !isArchitectureInterest && <div className="place-list">
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
                            <p className="place-story">{place.story}</p>
                            <div className={`interest-explanation-card ${isArchitectureInterest ? "architecture" : ""}`}>
                              <span>{interestExplanationLabel}</span>
                              <p>{getInterestSpecificExplanation(place)}</p>
                            </div>
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
                            {getInterestDidYouKnowFact(place, selectedInterest) && (
                              <aside className="did-you-know-card">
                                <span><Sparkles size={16} /> Did You Know</span>
                                <p>{getInterestDidYouKnowFact(place, selectedInterest)}</p>
                              </aside>
                            )}
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

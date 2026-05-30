import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, BookOpenText, Building2, ChevronLeft, ChevronRight, Church, Compass, ExternalLink, EyeOff, Gem, Headphones, Image, Info, Landmark, LockKeyhole, MapPin, Pause, Play, Route, ScrollText, Shirt, Sparkles, Store, Utensils, Video, WandSparkles, WifiOff } from "lucide-react";
import Navbar from "../component/Navbar";
import LoadingState from "../component/LoadingState";
import ErrorState from "../component/ErrorState";
import InAppMapModal from "../component/InAppMapModal";
import InAppMediaModal from "../component/InAppMediaModal";
import { generatePersonalizedStory, getCity } from "../services/api";
import { recordMetric } from "../utils/metrics";
import { hasPremiumAccess } from "../utils/premiumAccess";
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
    icon: Church
  },
  silk: {
    label: "Silk",
    title: "Weaving streets",
    text: "Handloom craft, saree shops, zari work, and artisan memory.",
    icon: Shirt
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
    icon: BookOpenText
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
    photos: place.photosUrl || `https://www.google.com/search?tbm=isch&q=${encodedQuery}`,
    videos: place.videosUrl || `https://www.youtube.com/results?search_query=${encodedQuery}+shorts`
  };
};

const isDirectImageUrl = (url) => {
  try {
    const parsed = new URL(url);
    return /\.(avif|gif|jpe?g|png|webp)$/i.test(parsed.pathname) || parsed.pathname.includes("Special:FilePath");
  } catch {
    return false;
  }
};

const buildInAppMedia = ({ kind, title, url, query }) => {
  let embedUrl = url;
  const mode = kind === "photos" && isDirectImageUrl(url) ? "image" : "frame";

  if (kind === "photos" && mode === "frame") {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("google.") && parsed.pathname === "/search") {
        parsed.searchParams.set("igu", "1");
        embedUrl = parsed.toString();
      }
    } catch {
      embedUrl = url;
    }
  }

  if (kind === "videos") {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./, "");
      const searchQuery = parsed.searchParams.get("search_query") || query || title;
      const videoId = host === "youtu.be"
        ? parsed.pathname.split("/").filter(Boolean)[0]
        : parsed.searchParams.get("v");

      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?rel=0`;
      } else if (host.endsWith("youtube.com")) {
        embedUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(searchQuery)}`;
      }
    } catch {
      embedUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query || title)}`;
    }
  }

  return {
    kind,
    title,
    embedUrl,
    externalUrl: url,
    mode
  };
};

const buildDirectionsMapUrl = (place, cityName) => {
  const hasCoordinates = Number.isFinite(Number(place.latitude)) && Number.isFinite(Number(place.longitude));
  const destination = hasCoordinates
    ? `${place.latitude},${place.longitude}`
    : buildPlaceQuery(place, cityName);
  return `https://maps.google.com/maps?output=embed&daddr=${encodeURIComponent(destination)}`;
};

const cleanDidYouKnowFact = (text) => {
  return String(text || "")
    .trim()
    .replace(/^did you know\s+(that\s+)?/i, "")
    .replace(/^it is\s+/i, "is ")
    .replace(/^it was\s+/i, "was ")
    .replace(/^the temple is\s+/i, "is ")
    .replace(/^the complex is\s+/i, "is ")
    .replace(/^the shrine is\s+/i, "is ")
    .replace(/^its name refers to\s+/i, "gets its name from ")
    .replace(/^its legend connects\s+/i, "has a legend connecting ")
    .replace(/^its sculptural panels are\s+/i, "has sculptural panels ")
    .replace(/^its\s+/i, "has ");
};

const formatDidYouKnowCardFact = (title, text) => {
  const cleaned = cleanDidYouKnowFact(text);
  if (!cleaned) return "";

  const normalizedTitle = String(title || "").trim();
  if (!normalizedTitle) return cleaned;

  if (cleaned.toLowerCase().startsWith(normalizedTitle.toLowerCase())) {
    return cleaned;
  }

  return `${normalizedTitle} ${cleaned}`;
};

const formatDidYouKnowFact = (title, text) => {
  const cardText = formatDidYouKnowCardFact(title, text);
  return cardText ? `Did you know ${cardText}` : "";
};

const hasListedValue = (value) => {
  return Boolean(value && !/^(not listed|check locally|check store)$/i.test(String(value).trim()));
};

const serviceFactById = {
  1001: "is a BPCL-branded fuel point, so it is best treated as a standard petrol and diesel stop rather than a vehicle-repair service.",
  1002: "is an HPCL outlet with a saved mobile contact, which helps travellers confirm fuel availability before relying on it.",
  1003: "is an HPCL outlet that also has a saved direct contact number, making phone confirmation its useful extra detail.",
  1004: "is a Nayara fuel outlet with an early listed opening time, useful for travellers who start before regular shop hours.",
  1005: "is a Bharat Petroleum outlet with a named dealer listing, making it easier to identify than generic fuel-stop entries.",
  1006: "is an IndianOil outlet, so its distinguishing point is access to that specific fuel network.",
  1007: "stands out because it lists auto LPG, which is different from regular petrol and diesel-only fuel stops.",
  1010: "is the Government Headquarters Hospital listing, making it the main public-hospital reference among the medical service options.",
  1011: "is another District Head Quarters Hospital entry, useful as a public emergency-care reference rather than a private clinic listing.",
  1012: "is a multi-speciality hospital listing, so it is more suitable for broader clinical support than a single-speciality clinic.",
  1013: "mentions 24-hour emergency service and multispecialty care, making emergency availability its most important traveller fact.",
  1014: "mentions 24-hour emergency service, which makes it relevant when medical help is needed outside normal clinic hours.",
  1015: "is a hospital listing with a landline contact, useful when travellers need to confirm department availability before going.",
  1016: "mentions 24-hour emergency support and a direct mobile contact, making it more urgent-care oriented than a routine clinic.",
  1017: "is a hospital listing with a local landline contact, useful for checking service availability before a visit.",
  1018: "stands out as an eye-hospital listing, so its role is specialist eye care rather than general emergency care.",
  1019: "mentions surgical and maternity speciality care, making it distinct from a general hospital listing.",
  1030: "is the A2B listing, a familiar vegetarian restaurant option for travellers who want predictable South Indian meals.",
  1031: "has a direct mobile contact saved, making it easier to confirm dining hours before planning a meal.",
  1032: "belongs to the Vasanta Bhavan restaurant family, so its strength is familiar vegetarian dining rather than local street snacks.",
  1033: "is an older hotel-style restaurant listing with a landline contact, different from newer cafe-style options.",
  1034: "calls itself a fine-dine option, which separates it from quick tiffin and tea-shop stops.",
  1035: "is the biriyani-focused restaurant in this service list, so it fits travellers looking for a heavier meal.",
  1036: "is a kitchen-style restaurant listing, useful for travellers looking for a proper cooked meal rather than cafe snacks.",
  1037: "has a direct mobile contact saved, useful for checking table availability or current hours before going.",
  1038: "is explicitly a multi-cuisine restaurant, which makes variety its distinguishing point.",
  1039: "is tied to GRT Regency, so it reads more like a hotel-restaurant option than a standalone street eatery.",
  1050: "uses a tea-themed name, making it a simple tea-break stop rather than a full meal service.",
  1051: "is coffee-focused by name, so it suits travellers who want coffee instead of a regular tea stall.",
  1052: "is marked as early-morning open, making timing its clearest advantage over standard tea-shop entries.",
  1053: "uses the Madras Coffee House name, pointing to coffee as the more distinctive part of the stop.",
  1054: "has no saved phone number, so it is best treated as a quick in-person tea stop rather than a pre-bookable service.",
  1055: "has a direct mobile contact saved, which makes it easier to confirm whether the tea stop is open.",
  1056: "uses a coffee-bar identity, so it is better read as a quick hot-drink stop than a restaurant.",
  1057: "is a branded Tea Time outlet, making it more chain-like than a small unnamed tea stall.",
  1058: "stands out for karupatti coffee, a palm-jaggery coffee style that is more specific than ordinary tea.",
  1059: "has a saved mobile contact and a modern tea-brand style name, making it more identifiable than unnamed tea stalls.",
  1070: "is listed as a 24-hour pharmacy, which is its most important difference from regular medical shops.",
  1071: "is an Apollo Pharmacy branch, useful for travellers who prefer a recognizable pharmacy chain.",
  1072: "is another Apollo Pharmacy entry, distinct because it has a separate branch contact for confirmation.",
  1073: "is a local medical shop with a landline contact, useful for checking medicine availability before visiting.",
  1074: "is a local medical shop with a direct mobile contact, useful when travellers want to call before searching in person.",
  1075: "has a direct mobile contact saved, useful for checking whether a medicine is available before visiting.",
  1076: "is a medicals listing without a saved phone number, so travellers should rely on directions and local confirmation.",
  1077: "is a Janaushadhi Kendra, which distinguishes it as a public generic-medicine outlet.",
  1078: "is a MedPlus listing, useful for travellers looking for a recognizable pharmacy network.",
  1079: "has a direct mobile contact saved, making phone confirmation its strongest traveller-useful detail.",
  1090: "is a Kanchi Super Market branch with a direct mobile contact, useful for confirming essentials before going.",
  1091: "is the Sengaluneer Odai branch of Kanchi Super Market, making it a specific neighbourhood grocery option.",
  1092: "is one of multiple Kanchi Super Market branches, distinguished here by its saved mobile contact.",
  1093: "is the Reliance Smart Bazaar listing, a larger-format supermarket option rather than a small provision store.",
  1094: "is the Nilgiris listing, a familiar supermarket brand for packaged groceries and travel basics.",
  1095: "is a local supermarket option with store-check guidance, useful when travellers need essentials but should confirm hours.",
  1096: "stands out as an organic supermarket listing, different from standard packaged-grocery stores.",
  1097: "is a compact supermarket listing, useful for everyday essentials rather than a large-format shopping trip.",
  1098: "is a supermarket listing with store-check guidance, so travellers should confirm availability before relying on it.",
  1110: "is a fresh-juice listing with a long evening timing, useful for a late cool-drink stop.",
  1111: "uses the Kanchi Fresh Juice name, making fresh fruit juice its clearest identity.",
  1112: "combines milk-chill and juice-shop identity, so it is more of a cold-drink stop than a plain juice counter.",
  1113: "is listed as a fresh fruit juice shop with morning-to-night timing, useful across most sightseeing hours.",
  1114: "is a Drunken Monkey outlet, a smoothie-style brand rather than a basic street juice stall.",
  1115: "has a saved mobile contact and evening hours, making it easier to confirm a cold-drink stop before going.",
  1116: "stands out for rose milk, a specific cool-drink choice rather than generic fruit juice.",
  1117: "uses a coconut-fresh identity, making it better for a tender-coconut style refreshment stop.",
  1130: "is a theatre option for evening entertainment, so its value depends on the current film schedule.",
  1131: "has a saved landline contact, making it easier to check show details than theatre listings without numbers.",
  1132: "is a theatre listing without a saved contact, so checking live show listings matters before visiting.",
  1133: "is a deluxe-theatre listing by name, making cinema entertainment its only traveller-service role.",
  1134: "has a saved theatre contact number, useful for confirming shows before going.",
  1135: "has a saved mobile contact, making it easier to verify current shows than entries without phone details.",
  1150: "is the town police-station listing, the broadest local police reference in this service group.",
  1151: "is the taluk police-station listing, useful when assistance may involve wider local administration.",
  1152: "is a local police-station listing, included for safety support rather than sightseeing.",
  1153: "is a local police-station listing for that jurisdiction, separate from the main town station.",
  1154: "is a local police-station listing, useful as a safety reference when nearby assistance is needed.",
  1155: "stands out as the traffic police listing, relevant for road, parking, accident, and route issues.",
  1156: "stands out as the all-women police-station listing, important for women travellers seeking appropriate assistance.",
  1170: "is an SBI branch listing with a toll-free contact, useful for travellers who specifically need SBI services.",
  1171: "is a second SBI listing without a saved branch phone, so travellers should verify services before going.",
  1172: "is an Indian Bank listing, useful when travellers specifically need that bank network.",
  1173: "is a Canara Bank branch listing, useful for travellers who need Canara Bank services.",
  1174: "is an HDFC Bank listing with a saved mobile contact, useful for confirming branch support.",
  1175: "is the ICICI Bank listing with a saved direct contact, useful for confirming branch services.",
  1176: "is the Axis Bank branch listing, useful for travellers who need Axis Bank services.",
  1177: "is a City Union Bank listing, making it distinct from nationalized and large private-bank options.",
  1178: "is an IDBI Bank listing with a saved contact, useful for confirming branch services first.",
  1179: "is a Federal Bank listing with a toll-free contact, useful when travellers need that bank network.",
  1190: "is a Unimoni listing, so its role is financial service support rather than a bank-branch visit.",
  1191: "is a Western Union listing with a direct mobile contact, useful for confirming remittance availability.",
  1192: "is another Western Union listing with a landline contact, giving travellers a separate confirmation option.",
  1193: "is a MoneyGram listing with a landline contact, useful for checking transfer rules before visiting.",
  1194: "is a second MoneyGram listing with a different landline contact, useful as an alternate counter option.",
  1195: "is a Muthoot Finance gold-loan service listing, which differs from standard cash-transfer counters.",
  1196: "is another Muthoot Finance gold-loan listing with the same saved contact, useful as an alternate branch option.",
  1197: "is marked as 24x7 local transfer, making timing its strongest distinguishing point.",
  1210: "is an SBI ATM listing, useful when travellers specifically want an SBI cash machine.",
  1211: "is a second SBI ATM entry, useful when travellers want another SBI cash-machine option.",
  1212: "is another SBI ATM entry, making the service list less dependent on a single cash point.",
  1213: "is an HDFC Bank ATM listing, useful for travellers looking for that bank network.",
  1214: "is an Axis Bank ATM listing, useful for travellers looking for that bank network.",
  1215: "is an ICICI Bank ATM listing, useful for travellers looking for that bank network.",
  1216: "is a Karur Vysya Bank ATM listing, distinct from SBI, HDFC, Axis, and ICICI cash points.",
  1217: "is a Canara Bank ATM listing, useful for travellers looking for that bank network.",
  1230: "is a Pantaloons listing, making it a branded ready-made clothing option rather than a local textile shop.",
  1231: "is a Trends Woman listing, so it is specifically useful for women's ready-made clothing.",
  1232: "is a garments listing, useful for quick ready-made clothing rather than saree-focused shopping.",
  1233: "is a menswear listing, making men's ready-made clothing its main distinction.",
  1234: "is a men's clothing listing, useful when travellers need men's ready-made wear quickly.",
  1235: "is a fashion-store listing without a saved contact, so it is better treated as a browse-in-person option.",
  1236: "is a men's clothing listing with a saved mobile contact, useful for checking availability first.",
  1237: "is a ready-made clothing shop with a landline contact, distinct from silk and saree stores.",
  1238: "is a Go Colors listing, making women's bottom-wear and colour-choice shopping its clearest role.",
  1239: "is a budget-fashion listing, useful when travellers want lower-cost ready-made clothing.",
  1250: "is listed as 24-hour puncture support, which is the strongest fact for unexpected tyre trouble.",
  1251: "uses 24X7 in the name and timing, making round-the-clock puncture help its core value.",
  1252: "is a wheel-care point, suggesting tyre and wheel attention beyond a simple puncture fix.",
  1253: "is a Bridgestone Select wheel-care listing, making brand-linked tyre support its distinction.",
  1270: "is a bike-doctor listing, so two-wheeler repair is its clearest role.",
  1271: "is a Castrol Bike Point listing, making branded two-wheeler service its distinguishing fact.",
  1272: "is a bike-care listing, useful for scooter or motorcycle checks rather than car repair.",
  1273: "is a named bike-mechanic listing, making two-wheeler breakdown support its main role.",
  1274: "is a two-wheeler service-center listing, distinct from general car-mechanic options.",
  1275: "is a myTVS service listing, making it a more organized vehicle-service option than a roadside mechanic.",
  1276: "is listed as 24-hour auto-garage support, useful for unexpected breakdowns outside regular hours.",
  1277: "is a car-care listing, so it fits car service needs better than bike or scooter repair.",
  1278: "is a car-mechanic listing with a saved mobile contact, useful for calling before moving the vehicle.",
  1279: "is a car-mechanic listing with check-locally guidance, so it is best used after confirming availability."
};

const getServiceDidYouKnowFact = (place) => {
  if (serviceFactById[place.id]) {
    return serviceFactById[place.id];
  }

  const category = (place.category || "").toLowerCase();
  const name = (place.name || "").toLowerCase();
  const hasContact = hasListedValue(place.contact);
  const hasTimings = hasListedValue(place.timings);
  const isFullDay = /24\s*(hours|hrs|x7)|24x7/i.test(place.timings || "");

  if (category === "petrol bunk") {
    if (name.includes("lpg")) {
      return "stands out because it lists auto LPG support, which is useful for travellers using LPG-fitted vehicles rather than only petrol or diesel.";
    }
    if (isFullDay) {
      return "stands out because it is listed as a 24-hour fuel stop, useful for early departures, late arrivals, or unplanned refuelling.";
    }
    return "is useful as a fuel-planning stop before longer drives, especially when travellers want to avoid searching for fuel after leaving the town centre.";
  }
  if (category === "hospital") {
    if (name.includes("eye")) {
      return "stands out as an eye-care hospital listing, useful when travellers need vision, eye injury, or specialist eye consultation support.";
    }
    if (name.includes("maternity")) {
      return "stands out because it mentions surgical and maternity speciality care, making it more specific than a general clinic listing.";
    }
    if (isFullDay || /emergency/i.test(place.timings || "")) {
      return "stands out because it lists emergency availability, which matters most when travellers need urgent medical help.";
    }
    return "is useful as a hospital reference where travellers should call first to confirm the right department, doctor availability, and emergency support.";
  }
  if (category === "hotel") {
    if (name.includes("grt") || name.includes("legacy")) {
      return "stands out as a more full-service stay option, useful for travellers who want stronger hotel facilities, dining, or event support.";
    }
    if (name.includes("ssk") || name.includes("pine") || name.includes("kaviya")) {
      return "is useful as a city-stay option for travellers who want to remain close to Kanchipuram's temple, shopping, and old-town movement.";
    }
    if (hasContact) {
      return "is useful because contact information is saved, so travellers can confirm room availability, check-in rules, parking, and current rates before going.";
    }
    return "is useful for stay planning; travellers should confirm live room availability, ID rules, check-in time, parking, and final price before booking.";
  }
  if (category === "restaurant") {
    if (name.includes("biriyani")) {
      return "stands out for biriyani-focused dining, making it a better match for travellers looking for a full meal rather than a snack stop.";
    }
    if (name.includes("fine dine") || name.includes("multi cuisine") || name.includes("dakshin")) {
      return "stands out as a more formal or multi-cuisine meal option, useful when travellers want a planned sit-down meal.";
    }
    if (name.includes("a2b") || name.includes("ananda bhavan") || name.includes("vasanta bhavan")) {
      return "stands out as a familiar vegetarian restaurant option, useful for predictable meals during temple-town travel.";
    }
    return "is useful for meal planning during sightseeing, especially when travellers want a proper food stop instead of only tea or juice.";
  }
  if (category === "tea shop") {
    if (name.includes("coffee")) {
      return "stands out as a coffee-focused stop, useful for travellers who prefer coffee over a regular tea break.";
    }
    if (hasTimings && /early/i.test(place.timings || "")) {
      return "stands out because it is marked as opening early, making timing its main difference from regular tea-shop entries.";
    }
    return "is useful for a short tea break between stops, especially when travellers want a quick local pause instead of a full meal.";
  }
  if (category === "medical shop") {
    if (name.includes("janaushadhi")) {
      return "stands out as a Janaushadhi medicine outlet, which is meant for affordable generic medicines under India's public pharmacy scheme.";
    }
    if (name.includes("apollo") || name.includes("medplus")) {
      return "stands out as a chain pharmacy listing, useful when travellers prefer a recognizable pharmacy network.";
    }
    if (isFullDay) {
      return "stands out because it is listed as a 24-hour pharmacy, useful for urgent basic medicine needs outside regular shop hours.";
    }
    return "is useful for basic pharmacy needs; travellers should carry prescriptions for medicines that require them.";
  }
  if (category === "super market") {
    if (name.includes("organic")) {
      return "stands out as an organic supermarket listing, useful for travellers looking for grocery choices beyond standard packaged essentials.";
    }
    if (name.includes("reliance") || name.includes("nilgiris")) {
      return "stands out as a recognizable supermarket brand, useful for predictable packaged essentials during travel.";
    }
    return "is useful for water, snacks, toiletries, and small essentials that travellers often need during a long day out.";
  }
  if (category === "juice shop") {
    if (name.includes("rose milk")) {
      return "stands out for rose milk, a local-style cool drink choice rather than a standard juice-only stop.";
    }
    if (name.includes("coco")) {
      return "stands out for coconut or fresh-drink service, useful during warm daytime sightseeing.";
    }
    if (name.includes("drunken monkey")) {
      return "stands out as a smoothie-style juice brand, useful for travellers looking beyond basic fresh juice.";
    }
    return "is useful for a quick cool drink break during warm sightseeing hours.";
  }
  if (category === "theatre") {
    return "is useful for evening entertainment planning; travellers should check the current show schedule before going.";
  }
  if (category === "police station") {
    if (name.includes("traffic")) {
      return "stands out as the traffic police listing, useful for road, parking, accident, or route-related assistance.";
    }
    if (name.includes("women")) {
      return "stands out as the all-women police station listing, useful for women travellers seeking appropriate local assistance.";
    }
    return "is included as a practical safety reference for travellers who need local police assistance.";
  }
  if (category === "bank") {
    if (hasContact) {
      return "stands out because a contact number is saved, useful when travellers need to confirm branch services before visiting.";
    }
    return "is useful for branch-level banking support; travellers should confirm working hours and the exact service they need first.";
  }
  if (category === "money transfer") {
    if (name.includes("western union")) {
      return "stands out as a Western Union money-transfer listing, useful for travellers who need that specific transfer network.";
    }
    if (name.includes("moneygram")) {
      return "stands out as a MoneyGram listing, useful for travellers who need that specific transfer network.";
    }
    if (name.includes("muthoot")) {
      return "stands out as a finance and gold-loan service listing rather than only a standard remittance counter.";
    }
    return "is useful for money-transfer needs; travellers should carry valid ID and confirm fees, limits, and service availability.";
  }
  if (category === "atm") {
    return "is useful for quick cash access, but travellers should keep a backup payment option because ATM cash and machine availability can change.";
  }
  if (category === "dress shop") {
    if (name.includes("pantaloons") || name.includes("trends") || name.includes("go colors")) {
      return "stands out as a branded clothing-store listing, useful for travellers who want predictable ready-made clothing options.";
    }
    if (name.includes("menswear") || name.includes("men's")) {
      return "stands out as a men's clothing listing, useful for quick ready-made clothing needs.";
    }
    return "is useful for ready-made clothing needs, separate from the city's silk and saree-focused shopping.";
  }
  if (category === "puncture shop") {
    if (isFullDay) {
      return "stands out because it is listed as 24-hour puncture support, useful for unexpected tyre trouble during travel.";
    }
    if (name.includes("bridgestone") || name.includes("wheel")) {
      return "stands out because it suggests tyre or wheel-care support beyond a basic puncture fix.";
    }
    return "is useful for tyre puncture support when travelling by bike, scooter, or car.";
  }
  if (category === "mechanic") {
    if (name.includes("car")) {
      return "stands out as a car-mechanic listing, useful for travellers who need car-specific repair support.";
    }
    if (name.includes("bike") || name.includes("two wheeler")) {
      return "stands out as a two-wheeler service listing, useful for travellers using bikes or scooters.";
    }
    if (isFullDay) {
      return "stands out because it is listed with 24-hour vehicle support, useful for unexpected breakdowns.";
    }
    return "is useful for vehicle checks or breakdown support during local travel.";
  }

  if (place.category) {
    return `is listed as a ${place.category} service, useful when travellers need that specific kind of practical support.`;
  }

  return "";
};

const getInterestDidYouKnowFact = (place, interest) => {
  const normalized = interest.toLowerCase();
  const name = (place.name || "").toLowerCase();
  const category = (place.category || "").toLowerCase();

  if (category && category === normalized) {
    return getServiceDidYouKnowFact(place);
  }

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

const getCityImages = (cityName) => {
  const slides = content.heroImageSlides?.[cityName];
  if (slides?.length) return slides;
  return [content.heroImages[cityName] || content.heroImages.default];
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
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [hasPremium] = useState(() => hasPremiumAccess());
  const [expandedInfoPlaceId, setExpandedInfoPlaceId] = useState(null);
  const [playingPlaceId, setPlayingPlaceId] = useState(null);
  const [mapView, setMapView] = useState(null);
  const [mediaView, setMediaView] = useState(null);
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

  const heroImages = city ? getCityImages(city.name) : [content.heroImages.default];
  const image = heroImages[heroImageIndex] || heroImages[0];

  useEffect(() => {
    setHeroImageIndex(0);
    if (!city || heroImages.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setHeroImageIndex((current) => (current + 1) % heroImages.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [city?.name, heroImages.length]);

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

  const openMediaView = ({ kind, title, url, placeId, query: mediaQuery }) => {
    if (!navigator.onLine) {
      window.alert("This feature needs an internet connection. Live maps, photos, and videos cannot open offline.");
      return;
    }

    recordMetric("media_open", { cityId: city.id, placeId, type: kind });
    setMediaView(buildInAppMedia({ kind, title, url, query: mediaQuery }));
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

  useEffect(() => {
    if (!microStories.length) return undefined;

    const timer = window.setInterval(() => {
      setMicroStoryIndex((current) => (current + 1) % microStorySlideCount);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [microStories.length, microStorySlideCount]);

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

  const openDirectionsMap = (place) => {
    if (!navigator.onLine) {
      window.alert("This feature needs an internet connection. Live maps cannot open offline.");
      return;
    }

    setMapView({
      title: `Directions to ${place.name}`,
      mapUrl: buildDirectionsMapUrl(place, city.name)
    });
    recordMetric("media_open", { cityId: city.id, placeId: place.id, type: "directions" });
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
                              <button
                                className="architecture-photo-link"
                                type="button"
                                onClick={() => openMediaView({
                                  kind: "photos",
                                  title: `${item.title} architecture picture`,
                                  url: item.imageLink,
                                  query: item.title
                                })}
                                aria-label={`Open ${item.title} architecture picture`}
                              >
                                <img src={item.image} alt={`${item.title} architecture`} loading="lazy" />
                                <span>{item.mood}</span>
                              </button>
                              <div className="architecture-image-content">
                                <span className="architecture-focus">{item.focus}</span>
                                <h4>{item.title}</h4>
                                <p>{item.text}</p>
                                <strong>Look for: {item.lookFor}</strong>
                                <button
                                  type="button"
                                  onClick={() => openMediaView({
                                    kind: "photos",
                                    title: `${item.title} architecture picture`,
                                    url: item.imageLink,
                                    query: item.title
                                  })}
                                >
                                  Open picture
                                  <Image size={13} />
                                </button>
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
                {!isPremiumLocked && !showPracticalDetails && (
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
                              {selectedInterest === "all" && <span>{interestExplanationLabel}</span>}
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
                              {!isArchitectureInterest && <button type="button" onClick={() => openDirectionsMap(place)}>
                                <MapPin size={15} />
                                Directions
                              </button>}
                              <button
                                type="button"
                                onClick={() => openMediaView({
                                  kind: "photos",
                                  title: `${place.name} photos`,
                                  url: links.photos,
                                  placeId: place.id,
                                  query: buildPlaceQuery(place, city.name)
                                })}
                              >
                                <Image size={15} />
                                {isArchitectureInterest ? "View architecture photos" : "Photos"}
                              </button>
                              {!isArchitectureInterest && <button
                                type="button"
                                onClick={() => openMediaView({
                                  kind: "videos",
                                  title: `${place.name} videos`,
                                  url: links.videos,
                                  placeId: place.id,
                                  query: buildPlaceQuery(place, city.name)
                                })}
                              >
                                <Video size={15} />
                                Videos
                              </button>}
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
      <InAppMapModal
        title={mapView?.title}
        mapUrl={mapView?.mapUrl}
        onClose={() => setMapView(null)}
      />
      <InAppMediaModal
        media={mediaView}
        onClose={() => setMediaView(null)}
      />
    </>
  );
}

export default CityDetails;

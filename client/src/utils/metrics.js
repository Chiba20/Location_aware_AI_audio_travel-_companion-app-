const METRICS_KEY = "everyStreetMetrics";
const VISIT_KEY = "everyStreetVisitSession";

const readEvents = () => {
  try {
    return JSON.parse(window.localStorage.getItem(METRICS_KEY)) || [];
  } catch {
    return [];
  }
};

export const recordMetric = (type, data = {}) => {
  const events = readEvents();
  const nextEvent = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    data,
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(METRICS_KEY, JSON.stringify([nextEvent, ...events].slice(0, 500)));
  return nextEvent;
};

export const recordAppOpen = () => {
  if (window.sessionStorage.getItem(VISIT_KEY)) return;
  window.sessionStorage.setItem(VISIT_KEY, "1");
  recordMetric("repeat_usage", { page: window.location.pathname });
};

export const analyzeSentiment = (comments = []) => {
  const positiveWords = ["good", "great", "excellent", "useful", "love", "nice", "amazing", "helpful", "memorable", "personal"];
  const negativeWords = ["bad", "poor", "slow", "confusing", "boring", "wrong", "difficult", "not good", "problem"];
  let positive = 0;
  let negative = 0;

  comments.forEach((comment) => {
    const text = String(comment || "").toLowerCase();
    positiveWords.forEach((word) => {
      if (text.includes(word)) positive += 1;
    });
    negativeWords.forEach((word) => {
      if (text.includes(word)) negative += 1;
    });
  });

  if (positive > negative) return "Positive";
  if (negative > positive) return "Needs attention";
  return comments.length ? "Neutral" : "Waiting for feedback";
};

export const getMetricsSummary = (feedback = []) => {
  const events = readEvents();

  return {
    repeatUsage: events.filter((event) => event.type === "repeat_usage").length,
    engagement: events.filter((event) => ["interest_select", "micro_story_swipe", "media_open", "ai_story_generated"].includes(event.type)).length,
    premiumConversions: events.filter((event) => event.type === "premium_conversion").length,
    sentiment: analyzeSentiment(feedback.map((item) => item.comment)),
  };
};

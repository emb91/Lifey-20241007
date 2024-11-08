// Search patterns for different search types
export const searchPatterns = {
  web: /(search|find|look up|tell me about)/,
  images: /(image|picture|photo|pic|show me)/,
  maps: /(location|address|where|directions|map)/,
  local: /(near|nearby|around|local|close to)/,
  events: /(event|show|concert|performance|what's on|festival)/,
  hotels: /(hotel|accommodation|motel|stay|resort)/,
  food: /(restaurant|food|eat|dining|cuisine|menu)/
};

// Engine parameters for each type
export const engineParams = {
  web: {
    engine: "google",
    google_domain: "google.co.nz",
    gl: "nz",
    hl: "en",
    num: "10",
    safe: "active"
  },
  images: {
    engine: "google_images",
    google_domain: "google.co.nz",
    gl: "nz",
    hl: "en",
    num: "10",
    safe: "active",
    tbs: "itp:photos"
  },
  maps: {
    engine: "google_maps",
    google_domain: "google.co.nz",
    gl: "nz",
    hl: "en",
    type: "search",
    num: "10",
    ll: "@-36.8484597,174.7633315,14z" // Auckland coordinates
  },
  local: {
    engine: "google_local",
    google_domain: "google.co.nz",
    gl: "nz",
    hl: "en",
    location: "Auckland, New Zealand",
    num: "10"
  },
  events: {
    engine: "google_events",
    google_domain: "google.co.nz",
    gl: "nz",
    hl: "en",
    location: "Auckland, New Zealand",
    num: "10"
  },
  hotels: {
    engine: "google_hotels",
    google_domain: "google.co.nz",
    gl: "nz",
    hl: "en",
    currency: "NZD",
    check_in_date: "auto", // Will be set dynamically
    check_out_date: "auto", // Will be set dynamically
    adults: "auto",
    num: "10"
  },
  food: {
    engine: "google_food",
    google_domain: "google.co.nz",
    gl: "nz",
    hl: "en",
    location: "Auckland, New Zealand",
    num: "10"
  }
};

// Common parameters for all searches
export const commonParams = {
  api_key: process.env.SERPAPI_API_KEY,
  no_cache: "true",
  device: "desktop"
};
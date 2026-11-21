/* =========================================================
   AGENCY INFORMATION & ACTIVITY LIST
   Everything marked [À REMPLACER] must be filled in with the
   agency's real information before going live.
   ========================================================= */
var SITE = {
  // Agency name (shown in the header, footer and page titles)
  agencyName: "Marrakech Odyssey Travel",
  // How the name is styled in the header/footer logo: [text, style]
  // style: "light" (thin, red) | "strong" (bold, dark) | "accent" (bold, red)
  brandParts: [["Marrakech ", "light"], ["Odyssey", "strong"]],

  // [À REMPLACER] WhatsApp number in international format, digits only (no +, no spaces)
  whatsapp: "212693323368",
  // How the number is displayed on the page
  whatsappDisplay: "+212 6 93 32 33 68",

  // [À REMPLACER] Email that receives quote requests.
  // Leave "" to hide every email option (the form then sends by WhatsApp only).
  email: "",

  // [À REMPLACER] Postal address (leave "" to hide it). It opens in Google Maps.
  address: "Marrakech, Maroc",
  // Optional: link to the agency's Google Business Profile (Google reviews,
  // opening hours, directions). Copy it from Google Maps > Share. Leave "" to hide.
  googleBusinessUrl: "",
  // Optional: the link that opens the "write a review" window on Google.
  // Google Business Profile > "Ask for reviews" > copy the link (g.page/r/.../review).
  // Shows a "Leave a review" button in the reviews section. Leave "" to hide.
  googleReviewUrl: "",

  // Optional: endpoint of a form service (Web3Forms, Formspree...) so the
  // "Send by email" button posts the request without opening a mail app.
  // Leave "" to fall back to opening the visitor's email app (mailto:).
  //   Formspree example: "https://formspree.io/f/abcdwxyz"
  formEndpoint: "",
  // Only for Web3Forms (endpoint "https://api.web3forms.com/submit"): your access key
  formAccessKey: "",

  // Free visitor statistics without cookies (leave both "" to disable).
  // Use ONE of them:
  //  - GoatCounter (shows WhatsApp clicks, quote requests...): create a site
  //    at goatcounter.com and put its code here, e.g. "marrakechodyssey"
  goatcounterCode: "",
  //  - Cloudflare Web Analytics (visits only): paste the site token
  cloudflareAnalyticsToken: "",

  // Public URL of the site once online (used for SEO links and link previews).
  // No trailing slash. Change it when the site gets its own domain.
  siteUrl: "https://marrakechodyssey.com",

  // Hide the site from Google (noindex) until the official launch
  // (real photos, legal page...). Set to false on launch day.
  hideFromSearch: false,

  // DEMO MODE: true while the contact details are placeholders.
  // - the site is hidden from Google (noindex)
  // - a small "Demo" badge is shown
  // - the form and WhatsApp/email buttons send NOTHING (a notice is shown instead)
  // Set to false once the agency's real WhatsApp number and email are filled in.
  demoMode: false,

  // Promises shown under the hero, and used in the FAQ and the legal page.
  // Set a value to 0 / false to stop promising it.
  promises: {
    freeWaitingMinutes: 60,     // free waiting time at the airport after landing
    nameSign: true,             // driver waits in arrivals with a name sign
    freeChildSeats: true,       // child seats free on request
    freeCancellationHours: 24   // free cancellation / changes up to X hours before pickup
  },

  // "From" prices on the service cards and activity cards.
  // Fill in the numbers, then set showPrices to true to display them.
  prices: { transfer: null, disposal: null },   // e.g. transfer: 150 (airport -> Marrakech)
  showPrices: false,
  currency: "MAD"
};

/* ---------------------------------------------------------
   PHOTOS  [À REMPLACER par les vraies photos de l'agence]
   Each value is either:
   - a local file in the "images" folder, e.g. "images/hero.jpg"  (recommended)
   - or a free Unsplash photo id, e.g. "photo-1597212618440-806262de4f6b"
     (temporary placeholders, free licence: unsplash.com/license)
   --------------------------------------------------------- */
var IMAGES = {
  hero:       "photo-1597212618440-806262de4f6b", // Koutoubia & Atlas
  transfer:   "photo-1532968899863-5b52ef155913",
  disposal:   "photo-1614091199036-e934784dbf0f",
  activities: "photo-1750008415039-65c10dcbb4a5",
  why:        "photo-1678976769979-e5ad2c17d305",
  contact:    "photo-1771148886150-fe1784951a68"
};

/* ---------------------------------------------------------
   ACTIVITIES
   - id:        unique key; the name and description of each activity
                are in content/translations.js under "act.<id>"
   - category:  "excursions" | "land" | "air" | "sea"
   - duration:  key of a duration label (see "dur.*" in translations.js)
   - safety:    true = guided activity, "safety equipment provided" is shown
   - price:     number or null  [À REMPLACER when prices are known]
   - image:     photo (same format as IMAGES above)
   - slug:      address of the activity page, e.g. activity/quad-marrakech.html
   To add an activity: add one line here AND its name/description
   in the four languages in translations.js.
   --------------------------------------------------------- */
var ACTIVITIES = [
  { id: "medina",      slug: "medina-souks-marrakech", category: "excursions", duration: "halfDay",   safety: false, price: null, place: "medina", image: "photo-1580746738099-1cb74f972feb" },
  { id: "ouzoud",      slug: "ouzoud-waterfalls", category: "excursions", duration: "fullDay",   safety: false, price: null, place: "ouzoud", image: "photo-1758622159686-7f61d8a81aa5" },
  { id: "essaouira",   slug: "essaouira-day-trip", category: "excursions", duration: "fullDay",   safety: false, price: null, place: "essaouira", image: "photo-1624802746702-60ca95bdb605" },
  { id: "ourika",      slug: "ourika-valley", category: "excursions", duration: "fullDay",   safety: false, price: null, place: "ourika", image: "photo-1638278958562-be34bf8946c3" },
  { id: "agafay",      slug: "agafay-desert", category: "excursions", duration: "evening",   safety: false, price: null, place: "agafay", image: "photo-1673283579119-d108cbd0ed7f" },
  { id: "quad",        slug: "quad-marrakech", category: "land",       duration: "h1to2",     safety: true,  price: null, image: "photo-1624664929003-3da28050c0bf" },
  { id: "buggy",       slug: "buggy-marrakech", category: "land",       duration: "h1to2",     safety: true,  price: null, image: "photo-1519021228607-ef6e4c22d821" },
  { id: "motocross",   slug: "motocross-marrakech", category: "land",       duration: "h1to2",     safety: true,  price: null, image: "photo-1765568562583-4252b2d854b0" },
  { id: "paintball",   slug: "paintball-marrakech", category: "land",       duration: "h1to2",     safety: true,  price: null, image: "photo-1588432892836-99b9aa3feb8a" },
  { id: "balloon",     slug: "hot-air-balloon-marrakech", category: "air",        duration: "sunrise",   safety: true,  price: null, image: "photo-1744669448689-c6d32c503209" },
  { id: "paragliding", slug: "paragliding-marrakech", category: "air",        duration: "onRequest", safety: true,  price: null, image: "photo-1471247511763-88a722fc9919" },
  { id: "jetski",      slug: "jet-ski-marrakech", category: "sea",        duration: "m30to60",   safety: true,  price: null, image: "photo-1505867798796-639ec7e8cdf5" },
  { id: "aquajet",     slug: "aquajet-marrakech", category: "sea",        duration: "onRequest", safety: true,  price: null, image: "photo-1505408990643-cb9bbf4bfe2c" }
];

var CATEGORIES = ["excursions", "land", "air", "sea"];

/* ---------------------------------------------------------
   VEHICLES ("Our vehicles" section + choice in the quote form)
   - id:     name/description in translations.js ("veh.<id>.name" / ".desc")
   - icon:   sedan | van | suv
   - image:  optional real photo, e.g. "images/minivan.jpg" (shown instead of the icon)
   --------------------------------------------------------- */
var VEHICLES = [
  { id: "sedan",   icon: "sedan", seats: 3, bags: 3, ac: true, image: "" },
  { id: "minivan", icon: "van",   seats: 7, bags: 6, ac: true, image: "" },
  { id: "suv",     icon: "suv",   seats: 4, bags: 3, ac: true, image: "" }
];

/* ---------------------------------------------------------
   ADDRESS SUGGESTIONS in the quote form (free, no API key)
   - Popular places below are suggested first (instant, offline),
     together with the DESTINATIONS further down.
   - Any other address is searched with Photon (OpenStreetMap data).
   - The driving distance/time estimate comes from the free OSRM router;
     if it is unreachable, a straight-line estimate is used instead.
   --------------------------------------------------------- */
var PLACES = [
  { name: "Gare de Marrakech (ONCF)", lat: 31.6305, lng: -8.0158 },
  { name: "Guéliz", lat: 31.6366, lng: -8.0105 },
  { name: "Hivernage", lat: 31.6215, lng: -8.0167 },
  { name: "Palmeraie", lat: 31.6702, lng: -7.9700 },
  { name: "Jemaa el-Fna", lat: 31.6258, lng: -7.9892 }
];
var GEOCODER_URL = "https://photon.komoot.io/api/";
var ROUTER_URL = "https://router.project-osrm.org/route/v1/driving/";

/* ---------------------------------------------------------
   CLIENT REVIEWS  (see GUIDE.md, section "Avis clients")
   Only REAL reviews, copied word for word from Google, TripAdvisor or a
   WhatsApp message, with the client's permission. While this list is empty,
   the reviews section stays hidden.
   - name:     first name + initial, e.g. "Sarah M."
   - country:  2-letter country code, e.g. "GB", "FR", "ES", "DE", "NL", "MA", "US"
   - rating:   1 to 5
   - date:     "2026-10" (year-month)
   - lang:     language the review was written in: "fr" "ar" "en" "es" "de" "nl" "it"...
   - text:     the review, as written by the client
   - activity: optional, id of an activity ("quad", "agafay"...): the review
               is then also shown on that activity's page
   - source:   optional, "Google" | "TripAdvisor" | "WhatsApp"
   Example:
   { name: "Sarah M.", country: "GB", rating: 5, date: "2026-10", lang: "en",
     text: "Our driver was waiting with a sign at 2am. Spotless car, fair price.",
     activity: "agafay", source: "Google" },
   --------------------------------------------------------- */
var REVIEWS = [
];

/* ---------------------------------------------------------
   DESTINATIONS on the Google Maps section ("Where we go")
   - id:       for the name, "act.<id>.name" or "dest.<id>" in translations.js
   - lat/lng:  GPS position (right-click a place in Google Maps to copy it)
   - zoom:     map zoom level (higher = closer)
   - km / minutes: approximate distance and drive time from Marrakech
                   [À VÉRIFIER par l'agence]
   Activities with  place: "<id>"  get a "View on map" button.
   --------------------------------------------------------- */
var DESTINATIONS = [
  { id: "medina",    lat: 31.6258, lng: -7.9892, zoom: 14, km: 0,   minutes: 0 },
  { id: "airport",   lat: 31.6069, lng: -8.0363, zoom: 13, km: 6,   minutes: 15 },
  { id: "agafay",    lat: 31.4410, lng: -8.1780, zoom: 11, km: 40,  minutes: 50 },
  { id: "ourika",    lat: 31.2256, lng: -7.6778, zoom: 11, km: 65,  minutes: 80 },
  { id: "ouzoud",    lat: 32.0154, lng: -6.7190, zoom: 12, km: 150, minutes: 165 },
  { id: "essaouira", lat: 31.5125, lng: -9.7700, zoom: 13, km: 190, minutes: 165 }
];

if (typeof module !== "undefined") module.exports = { SITE: SITE, IMAGES: IMAGES, ACTIVITIES: ACTIVITIES, CATEGORIES: CATEGORIES, DESTINATIONS: DESTINATIONS, PLACES: PLACES, VEHICLES: VEHICLES, REVIEWS: REVIEWS, GEOCODER_URL: GEOCODER_URL, ROUTER_URL: ROUTER_URL };

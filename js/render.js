/* =========================================================
   PAGE RENDERER
   Builds the page HTML for one language. Used in the browser
   (language switch) and by build.mjs (pre-rendered pages for SEO).
   You normally don't need to edit this file: text lives in
   content/translations.js, agency data and photos in content/site.js.
   ========================================================= */
(function (root) {
  var env = root.SITE ? root : require("../content/site.js");
  var tr = root.I18N ? root : require("../content/translations.js");
  var SITE = env.SITE, IMAGES = env.IMAGES, ACTIVITIES = env.ACTIVITIES, CATEGORIES = env.CATEGORIES, DESTINATIONS = env.DESTINATIONS || [], VEHICLES = env.VEHICLES || [];
  var PROMISES = SITE.promises || {};
  // Real client reviews only (content/site.js); newest first
  var REVIEWS = (env.REVIEWS || []).filter(function (r) { return r && r.name && r.text && r.rating >= 1 && r.rating <= 5; })
    .slice().sort(function (a, b) { return String(b.date || "").localeCompare(String(a.date || "")); });
  var I18N = tr.I18N, LANGS = tr.LANGS, LANG_NAMES = tr.LANG_NAMES, LANG_SHORT = tr.LANG_SHORT, RTL_LANGS = tr.RTL_LANGS;

  // Base URL for local files (images/...). Set by the browser script so that
  // paths keep working after a language switch on /ar/, /en/, /es/ pages.
  var ASSET_BASE = "";
  function asset(p) { return /^(https?:|data:|\/)/.test(p) ? p : ASSET_BASE + p; }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function t(lang, key, vars) {
    var dict = I18N[lang] || I18N.fr;
    var s = dict[key] != null ? dict[key] : (I18N.fr[key] != null ? I18N.fr[key] : key);
    vars = vars || {};
    return s.replace(/\{(\w+)\}/g, function (m, k) {
      if (k === "agency") return SITE.agencyName;
      if (k === "count") return ACTIVITIES.length;
      if (k === "wait") return PROMISES.freeWaitingMinutes;
      if (k === "cancel") return PROMISES.freeCancellationHours;
      return vars[k] != null ? vars[k] : m;
    });
  }
  function e(lang, key, vars) { return esc(t(lang, key, vars)); }

  function icon(name, cls) {
    // width/height = safe default size even if the stylesheet is missing or outdated
    return '<svg aria-hidden="true" focusable="false" width="24" height="24"' + (cls ? ' class="' + cls + '"' : "") + '><use href="#i-' + name + '"/></svg>';
  }

  /* Photo: Unsplash id ("photo-...") -> responsive WebP copies stored in images/photos/
     (made by tools/photos.py), otherwise local file */
  function img(src, opts) {
    opts = opts || {};
    if (!src) return "";
    var sizes = opts.sizes || "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";
    var attrs = ' alt="' + esc(opts.alt || "") + '" decoding="async"' +
      (opts.eager ? ' fetchpriority="high"' : ' loading="lazy"') +
      (opts.cls ? ' class="' + opts.cls + '"' : "") + ' width="' + (opts.w || 800) + '" height="' + (opts.h || 600) + '"';
    if (/^photo-/.test(src)) {
      var base = asset("images/photos/" + src + "-");
      var widths = opts.widths || [480, 800, 1200];
      return '<img src="' + base + widths[1] + '.webp" srcset="' +
        widths.map(function (w) { return base + w + ".webp " + w + "w"; }).join(", ") +
        '" sizes="' + sizes + '"' + attrs + ">";
    }
    return '<img src="' + esc(asset(src)) + '"' + attrs + ">";
  }

  function brandInner() {
    var parts = SITE.brandParts && SITE.brandParts.length ? SITE.brandParts : [[SITE.agencyName, "strong"]];
    return '<img class="brand-logo" src="' + asset("images/logo-emblem.png") + '" alt="" width="60" height="78">' +
      '<span class="brand-word"><img class="bw bw-navy" src="' + asset("images/wordmark.png") + '" alt="" width="163" height="64">' +
      '<img class="bw bw-white" src="' + asset("images/wordmark-white.png") + '" alt="" width="163" height="64"></span>' +
      '<span class="visually-hidden">' + esc(parts.map(function (p) { return p[0]; }).join(" ")) + "</span>";
  }

  var CAT_ICON = { excursions: "map", land: "mountain", air: "wind", sea: "waves" };
  var SVC_ICON = { transfer: "plane", disposal: "car", activity: "map" };

  function waLink(text) {
    return "https://wa.me/" + SITE.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");
  }

  /* ---------- Google Maps (no API key needed) ---------- */
  function mapsSearch(q) { return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q); }
  function mapsRoute(from, to) {
    return "https://www.google.com/maps/dir/?api=1&origin=" + encodeURIComponent(from) + "&destination=" + encodeURIComponent(to) + "&travelmode=driving";
  }
  function mapsEmbed(d, lang) {
    return "https://maps.google.com/maps?q=" + d.lat + "," + d.lng + "&z=" + (d.zoom || 11) + "&hl=" + lang + "&output=embed";
  }
  function destName(lang, d) {
    return t(lang, I18N.fr["act." + d.id + ".name"] != null ? "act." + d.id + ".name" : "dest." + d.id);
  }
  function formatTrip(lang, km, minutes) {
    minutes = Math.max(1, Math.round(minutes));
    var h = Math.floor(minutes / 60), m = minutes % 60;
    var dur = (h ? h + " " + t(lang, "unit.h") + (m ? " " : "") : "") + (m ? (h ? String(m).padStart(2, "0") : m) + (h && lang === "fr" ? "" : " " + t(lang, "unit.min")) : "");
    var kmTxt = km < 10 ? Math.round(km * 10) / 10 : Math.round(km);
    return "≈ " + String(kmTxt).replace(".", lang === "en" ? "." : ",") + " " + t(lang, "unit.km") + " · " + dur;
  }
  function destMeta(lang, d) {
    if (!d.km) return t(lang, "map.center");
    return formatTrip(lang, d.km, d.minutes) + " " + t(lang, "map.from");
  }

  function langSwitch(lang, cls) {
    return '<div class="lang-switch' + (cls ? " " + cls : "") + '" role="group" aria-label="' + e(lang, "lang.label") + '">' +
      LANGS.map(function (l) {
        return '<button type="button" data-lang="' + l + '" lang="' + l + '" aria-pressed="' + (l === lang) + '" title="' + esc(LANG_NAMES[l]) + '">' +
          '<span aria-hidden="true">' + esc(LANG_SHORT[l]) + '</span><span class="visually-hidden">' + esc(LANG_NAMES[l]) + "</span></button>";
      }).join("") + "</div>";
  }

  // Header language picker: "🌐 FR ▾" button opening the list of languages
  function langMenu(lang) {
    return '<div class="lang-menu">' +
      '<button type="button" class="lang-menu-btn" aria-expanded="false" aria-controls="lang-list">' +
        icon("globe") + '<span class="lang-current" aria-hidden="true">' + esc(LANG_SHORT[lang]) + "</span>" +
        '<span class="visually-hidden">' + e(lang, "lang.label") + " (" + esc(LANG_NAMES[lang]) + ")</span>" + icon("chevron", "lang-chevron") +
      "</button>" +
      '<ul class="lang-list" id="lang-list" hidden>' + LANGS.map(function (l) {
        return '<li><button type="button" data-lang="' + l + '" lang="' + l + '" aria-pressed="' + (l === lang) + '">' +
          '<span class="lang-code" aria-hidden="true">' + esc(LANG_SHORT[l]) + "</span>" + esc(LANG_NAMES[l]) + "</button></li>";
      }).join("") + "</ul></div>";
  }

  function navLinks(lang) {
    return '<li><a href="#services">' + e(lang, "nav.services") + "</a></li>" +
      '<li><a href="#activities">' + e(lang, "nav.activities") + "</a></li>" +
      '<li><a href="#why">' + e(lang, "nav.why") + "</a></li>" +
      '<li><a href="#contact">' + e(lang, "nav.contact") + "</a></li>";
  }

  // Light/dark switch: a pressed button = dark mode on
  function themeToggle(lang, withLabel) {
    return '<button type="button" class="theme-toggle" aria-pressed="false"' + (withLabel ? "" : ' aria-label="' + e(lang, "theme.dark") + '"') + ">" +
      '<svg class="i-moon" aria-hidden="true" width="22" height="22"><use href="#i-moon"/></svg><svg class="i-sun" aria-hidden="true" width="22" height="22"><use href="#i-sun"/></svg>' +
      (withLabel ? "<span>" + e(lang, "theme.dark") + "</span>" : "") + "</button>";
  }

  function header(lang) {
    return '<a class="skip-link" href="#main">' + e(lang, "skip") + "</a>" +
      '<header class="site-header is-top"><div class="container header-inner">' +
        '<a class="brand" href="#top">' + brandInner() + "</a>" +
        '<nav class="main-nav" id="main-nav" aria-label="' + e(lang, "nav.label") + '"><ul>' + navLinks(lang) +
          '<li class="theme-row">' + themeToggle(lang, true) + "</li></ul></nav>" +
        langMenu(lang) +
        '<a class="btn btn-action btn-sm header-cta" href="#quote" data-quote="transfer">' + e(lang, "hero.ctaQuote") + "</a>" +
        themeToggle(lang) +
        '<button type="button" class="menu-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="' + e(lang, "nav.menu") + '">' + icon("menu") + "</button>" +
      "</div></header>";
  }

  function field(lang, id, name, labelKey, inputAttrs, cls, ic) {
    return '<div class="field' + (cls ? " " + cls : "") + '">' +
      '<label for="' + id + '">' + e(lang, labelKey) + "</label>" +
      '<div class="input-wrap">' + (ic ? icon(ic, "input-icon") : "") +
      '<input id="' + id + '" name="' + name + '" ' + inputAttrs + ' aria-describedby="' + id + '-err"></div>' +
      '<span class="field-error" id="' + id + '-err" aria-live="polite"></span></div>';
  }

  // Address field with suggestions (combobox pattern)
  function acField(lang, id, name, labelKey, phKey, ic) {
    return '<div class="field">' +
      '<label for="' + id + '">' + e(lang, labelKey) + "</label>" +
      '<div class="input-wrap">' + icon(ic, "input-icon") +
      '<input id="' + id + '" name="' + name + '" type="text" required autocomplete="off" spellcheck="false" placeholder="' + e(lang, phKey) + '"' +
        ' role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="' + id + '-list" aria-describedby="' + id + '-err">' +
      '<input type="hidden" name="' + name + 'Coords" id="' + id + '-coords">' +
      '<ul class="ac-list" id="' + id + '-list" role="listbox" aria-label="' + e(lang, labelKey) + '" hidden></ul>' +
      "</div>" +
      '<span class="field-error" id="' + id + '-err" aria-live="polite"></span></div>';
  }

  function quoteForm(lang) {
    var services = ["transfer", "disposal", "activity"];
    return '<div class="quote-card" id="quote">' +
      '<div class="quote-head"><h2 id="quote-title">' + e(lang, "form.title") + "</h2>" +
      '<p class="hint">' + e(lang, "form.hint") + "</p></div>" +
      '<form id="quote-form" class="form-grid" novalidate aria-labelledby="quote-title">' +
        '<fieldset class="service-choice"><legend>' + e(lang, "form.service") + "</legend>" +
          '<div class="segmented">' + services.map(function (s, i) {
            return '<input type="radio" name="service" id="svc-' + s + '" value="' + s + '"' + (i === 0 ? " checked" : "") + '>' +
              '<label for="svc-' + s + '">' + icon(SVC_ICON[s]) + "<span>" + e(lang, "svc." + s) + "</span></label>";
          }).join("") + "</div></fieldset>" +
        acField(lang, "q-from", "from", "form.from", "form.fromPh", "pin") +
        acField(lang, "q-to", "to", "form.to", "form.toPh", "flag") +
        '<datalist id="acts-list">' + ACTIVITIES.map(function (a) { return '<option value="' + e(lang, "act." + a.id + ".name") + '">'; }).join("") + "</datalist>" +
        field(lang, "q-date", "date", "form.date", 'type="date" required', "half") +
        field(lang, "q-time", "time", "form.time", 'type="time" step="300"', "half") +
        // flight number: only shown for airport transfers
        '<div class="field" id="q-flight-field">' +
          '<label for="q-flight">' + e(lang, "form.flight") + "</label>" +
          '<div class="input-wrap">' + icon("plane", "input-icon") +
          '<input id="q-flight" name="flight" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" dir="ltr" maxlength="10" placeholder="' + e(lang, "form.flightPh") + '" aria-describedby="q-flight-hint q-flight-err"></div>' +
          '<small class="field-hint" id="q-flight-hint">' + e(lang, "form.flightHint") + "</small>" +
          '<span class="field-error" id="q-flight-err" aria-live="polite"></span></div>' +
        field(lang, "q-pax", "passengers", "form.passengers", 'type="number" inputmode="numeric" min="1" max="60" value="2" required', "", "users") +
        // return ride
        '<div class="field check-field"><label class="check" for="q-return"><input type="checkbox" id="q-return" name="returnTrip" value="yes" aria-controls="q-return-fields">' +
          "<span>" + e(lang, "form.return") + "</span></label></div>" +
        '<div class="field sub-grid" id="q-return-fields" hidden>' +
          field(lang, "q-rdate", "returnDate", "form.returnDate", 'type="date"', "half") +
          field(lang, "q-rtime", "returnTime", "form.returnTime", 'type="time" step="300"', "half") +
        "</div>" +
        // optional details, folded
        '<details class="field more-options" id="q-more"><summary>' + icon("bag") + "<span>" + e(lang, "form.more") + "</span>" + icon("chevron", "more-chev") + "</summary>" +
        '<div class="sub-grid">' +
        field(lang, "q-bags", "bags", "form.bags", 'type="number" inputmode="numeric" min="0" max="60"', "half", "bag") +
        field(lang, "q-kids", "kids", "form.kids", 'type="text" autocomplete="off" placeholder="' + e(lang, "form.kidsPh") + '"', "half") +
        (VEHICLES.length ? '<div class="field">' +
          '<label for="q-veh">' + e(lang, "form.vehicle") + "</label>" +
          '<div class="input-wrap">' + icon("car", "input-icon") + '<select id="q-veh" name="vehicle">' +
            '<option value="">' + e(lang, "form.vehicleAny") + "</option>" +
            VEHICLES.map(function (v) { return '<option value="' + esc(v.id) + '">' + e(lang, "veh." + v.id + ".name") + " (" + e(lang, "veh.seats", { n: v.seats }) + ")</option>"; }).join("") +
          "</select></div>" +
          '<p class="veh-hint" id="q-veh-hint" aria-live="polite" hidden><span></span> <button type="button" class="link-cta" id="q-veh-switch"></button></p>' +
          "</div>" : "") +
        "</div></details>" +
        field(lang, "q-name", "name", "form.name", 'type="text" required autocomplete="name" placeholder="' + e(lang, "form.namePh") + '"', "half") +
        '<div class="field half">' +
          '<label for="q-contact">' + e(lang, "form.contact") + "</label>" +
          '<div class="input-wrap"><input id="q-contact" name="contact" type="text" autocomplete="email" dir="ltr" placeholder="' + e(lang, "form.contactPh") + '" aria-describedby="' + (SITE.email || SITE.formEndpoint ? "q-contact-hint " : "") + 'q-contact-err"></div>' +
          (SITE.email || SITE.formEndpoint ? '<small class="field-hint" id="q-contact-hint">' + e(lang, "form.contactHint") + "</small>" : "") +
          '<span class="field-error" id="q-contact-err" aria-live="polite"></span></div>' +
        '<div class="route-row">' +
          '<p class="route-estimate" id="q-estimate" aria-live="polite" hidden>' + icon("car") + '<span><span class="visually-hidden">' + e(lang, "form.estimate") + " : </span><b></b></span></p>" +
          '<a class="route-link" id="q-route" href="#" target="_blank" rel="noopener" hidden>' + icon("map") + "<span>" + e(lang, "form.route") + "</span></a>" +
        "</div>" +
        '<div class="form-status" role="status" aria-live="polite" id="form-status"></div>' +
        '<div class="form-actions">' +
          '<button type="submit" class="btn btn-action btn-block btn-lg" value="whatsapp">' + icon("whatsapp") + "<span>" + e(lang, "form.sendWa") + "</span></button>" +
          (SITE.email || SITE.formEndpoint ? '<button type="submit" class="btn btn-quiet btn-block" value="email">' + icon("mail") + "<span>" + e(lang, "form.sendEmail") + "</span></button>" : "") +
        "</div>" +
        '<p class="privacy-note">' + icon("lock") + "<span>" + e(lang, "form.privacy") + ' <a href="legal.html#privacy">' + e(lang, "form.privacyMore") + "</a></span></p>" +
      "</form></div>";
  }

  /* ---------- Reviews ---------- */
  function locale(lang) { return lang === "ar" ? "ar-MA" : lang; }   // Latin digits in Arabic
  function intlName(lang, type, code) {
    try { return new Intl.DisplayNames([locale(lang)], { type: type }).of(code) || code; } catch (err) { return code; }
  }
  function fmtNum(lang, x) {
    try { return Number(x).toLocaleString(locale(lang), { maximumFractionDigits: 1 }); } catch (err) { return String(x); }
  }
  function reviewStats() {
    if (!REVIEWS.length) return null;
    var sum = REVIEWS.reduce(function (s, r) { return s + Number(r.rating); }, 0);
    return { n: REVIEWS.length, avg: Math.round(sum / REVIEWS.length * 10) / 10 };
  }
  function stars(lang, rating) {
    var html = "";
    for (var i = 1; i <= 5; i++) html += i <= Math.round(rating) ? icon("star-solid", "on") : icon("star");
    return '<span class="stars" role="img" aria-label="' + e(lang, "reviews.stars", { n: fmtNum(lang, rating) }) + '">' + html + "</span>";
  }
  function reviewSummary(lang, st) {
    return e(lang, st.n === 1 ? "reviews.summaryOne" : "reviews.summary", { avg: fmtNum(lang, st.avg), n: st.n });
  }
  function reviewDate(lang, d) {
    var m = /^(\d{4})-(\d{1,2})/.exec(d || "");
    if (!m) return "";
    try {
      return new Intl.DateTimeFormat(locale(lang), { month: "long", year: "numeric", timeZone: "UTC" })
        .format(new Date(Date.UTC(+m[1], +m[2] - 1, 15)));
    } catch (err) { return d; }
  }
  function reviewCard(lang, r, i, opts) {
    opts = opts || {};
    var meta = [r.country ? intlName(lang, "region", String(r.country).toUpperCase()) : "", reviewDate(lang, r.date)].filter(Boolean).join(" · ");
    var other = r.lang && r.lang !== lang;
    var act = r.activity && opts.showActivity !== false && ACTIVITIES.some(function (a) { return a.id === r.activity; });
    return '<figure class="review-card' + (opts.reveal === false ? "" : " reveal") + '" style="--d:' + Math.min(i, 3) * 80 + 'ms">' +
      '<div class="review-top">' + stars(lang, r.rating) + (r.source ? '<span class="review-src">' + esc(r.source) + "</span>" : "") + "</div>" +
      "<blockquote" + (r.lang ? ' lang="' + esc(r.lang) + '" dir="' + (RTL_LANGS.indexOf(r.lang) !== -1 ? "rtl" : "auto") + '"' : "") + "><p>" + esc(r.text) + "</p></blockquote>" +
      (other ? '<p class="review-lang">' + e(lang, "reviews.written", { lang: intlName(lang, "language", r.lang) }) + "</p>" : "") +
      "<figcaption>" + '<span class="review-avatar" aria-hidden="true">' + esc(String(r.name).trim().charAt(0).toUpperCase()) + "</span>" +
        "<span><strong><bdi>" + esc(r.name) + "</bdi></strong>" + (meta ? "<small>" + esc(meta) + "</small>" : "") +
        (act ? '<small class="review-act">' + icon("map") + e(lang, "act." + r.activity + ".name") + "</small>" : "") +
        "</span></figcaption>" +
    "</figure>";
  }
  function reviewsFor(activityId) { return REVIEWS.filter(function (r) { return r.activity === activityId; }); }
  function reviews(lang) {
    var st = reviewStats();
    if (!st) return "";
    return '<section class="section" id="reviews" aria-labelledby="reviews-title"><div class="container">' +
      sectionHead(lang, "reviews-title", "reviews.title", "reviews.lead", "reviews.kicker", "center") +
      '<div class="review-summary reveal">' + stars(lang, st.avg) + "<strong>" + reviewSummary(lang, st) + "</strong></div>" +
      '<div class="review-grid">' + REVIEWS.slice(0, 6).map(function (r, i) { return reviewCard(lang, r, i); }).join("") + "</div>" +
      ((SITE.googleReviewUrl || SITE.googleBusinessUrl) ? '<div class="review-ctas reveal">' +
        (SITE.googleReviewUrl ? '<a class="btn btn-action" href="' + esc(SITE.googleReviewUrl) + '" target="_blank" rel="noopener">' + icon("star") + e(lang, "reviews.leave") + "</a>" : "") +
        (SITE.googleBusinessUrl ? '<a class="btn btn-quiet" href="' + esc(SITE.googleBusinessUrl) + '" target="_blank" rel="noopener">' + e(lang, "reviews.seeAll") + "</a>" : "") +
      "</div>" : "") +
    "</div></section>";
  }
  // Small rating badge under the hero buttons (from 3 reviews)
  function heroRating(lang) {
    var st = reviewStats();
    if (!st || st.n < 3) return "";
    return '<a class="hero-rating" href="#reviews">' + stars(lang, st.avg) + "<span>" + reviewSummary(lang, st) + "</span></a>";
  }

  function hero(lang) {
    return '<section class="hero" id="top">' +
      '<div class="hero-media">' + img(IMAGES.hero, { eager: true, sizes: "100vw", widths: [800, 1200, 1600, 2000], w: 2000, h: 1333 }) + "</div>" +
      '<div class="container hero-grid">' +
        '<div class="hero-copy">' +
          '<span class="eyebrow">' + e(lang, "hero.eyebrow") + "</span>" +
          "<h1>" + e(lang, "hero.title") + "</h1>" +
          '<p class="lead">' + e(lang, "hero.lead") + "</p>" +
          '<div class="hero-ctas">' +
            '<a class="btn btn-action btn-lg" href="#quote" data-quote="transfer">' + e(lang, "hero.ctaQuote") + "</a>" +
            '<a class="btn btn-glass btn-lg" href="#activities">' + e(lang, "hero.ctaActivities") + icon("arrow", "flip-rtl") + "</a>" +
          "</div>" + heroRating(lang) +
        "</div>" +
        quoteForm(lang) +
      "</div>" +
    "</section>" +
    promiseStrip(lang);
  }

  // "Our promises" strip under the hero (each promise can be switched off in site.js)
  function promiseStrip(lang) {
    var items = [
      PROMISES.freeWaitingMinutes && ["clock", "wait"],
      PROMISES.nameSign && ["sign", "sign"],
      PROMISES.freeChildSeats && ["heart", "seats"],
      PROMISES.freeCancellationHours && ["calendar", "cancel"]
    ].filter(Boolean);
    if (!items.length) {
      items = [["check", null, "hero.p1"], ["whatsapp", null, "hero.p2"], ["headset", null, "hero.p3"], ["shield", null, "hero.p4"]];
      return '<div class="trust-strip"><div class="container"><ul>' + items.map(function (p) {
        return "<li>" + icon(p[0]) + "<span>" + e(lang, p[2]) + "</span></li>";
      }).join("") + "</ul></div></div>";
    }
    return '<section class="trust-strip promises" aria-label="' + e(lang, "promise.label") + '"><div class="container"><ul>' + items.map(function (p) {
      return "<li>" + icon(p[0]) + '<span><strong>' + e(lang, "promise." + p[1] + ".title") + "</strong><small>" + e(lang, "promise." + p[1] + ".desc") + "</small></span></li>";
    }).join("") + "</ul></div></section>";
  }

  function sectionHead(lang, id, titleKey, leadKey, eyebrowKey, cls) {
    return '<div class="section-head reveal' + (cls ? " " + cls : "") + '">' +
      (eyebrowKey ? '<span class="kicker">' + e(lang, eyebrowKey) + "</span>" : "") +
      '<h2 id="' + id + '">' + e(lang, titleKey) + "</h2>" +
      (leadKey ? "<p>" + e(lang, leadKey) + "</p>" : "") + "</div>";
  }

  function services(lang) {
    var items = [
      { key: "transfer", icon: "plane", service: "transfer", image: IMAGES.transfer },
      { key: "disposal", icon: "car", service: "disposal", image: IMAGES.disposal },
      { key: "activities", icon: "map", service: "activity", image: IMAGES.activities }
    ];
    return '<section class="section" id="services" aria-labelledby="services-title"><div class="container">' +
      sectionHead(lang, "services-title", "services.title", "services.lead", "nav.services") +
      '<div class="service-grid">' + items.map(function (it, i) {
        var p = "services." + it.key;
        return '<article class="service-card reveal" style="--d:' + i * 90 + 'ms">' +
          '<div class="service-media">' + img(it.image) + '<span class="service-icon">' + icon(it.icon) + "</span></div>" +
          '<div class="service-body">' +
            "<h3>" + e(lang, p + ".title") + "</h3>" +
            (SITE.showPrices && SITE.prices && SITE.prices[it.key] ? '<p class="price service-price">' + e(lang, "acts.from") + " <strong>" + esc(SITE.prices[it.key]) + " " + esc(SITE.currency) + "</strong></p>" : "") +
            "<p>" + e(lang, p + ".desc") + "</p>" +
            "<ul>" + [1, 2, 3].map(function (n) { return "<li>" + icon("check") + "<span>" + e(lang, p + ".b" + n) + "</span></li>"; }).join("") + "</ul>" +
            (it.key === "activities"
              ? '<a class="link-cta" href="#activities">' + e(lang, "services.seeActs") + icon("arrow", "flip-rtl") + "</a>"
              : '<a class="link-cta" href="#quote" data-quote="' + it.service + '">' + e(lang, "services.cta") + icon("arrow", "flip-rtl") + "</a>") +
          "</div>" +
        "</article>";
      }).join("") + "</div>" +
      vehicles(lang) +
    "</div></section>";
  }

  function vehicles(lang) {
    if (!VEHICLES.length) return "";
    return '<div class="vehicles" id="vehicles">' +
      '<div class="section-head reveal vehicles-head"><h3 class="h2-like">' + e(lang, "vehicles.title") + "</h3><p>" + e(lang, "vehicles.lead") + "</p></div>" +
      '<div class="vehicle-grid">' + VEHICLES.map(function (v, i) {
        return '<article class="vehicle-card reveal" style="--d:' + i * 90 + 'ms">' +
          (v.image ? '<div class="vehicle-media">' + img(v.image, { sizes: "(min-width: 900px) 33vw, 100vw" }) + "</div>"
                   : '<div class="vehicle-art" aria-hidden="true">' + icon(v.icon, "vehicle-icon") + "</div>") +
          '<div class="vehicle-body"><h4>' + e(lang, "veh." + v.id + ".name") + "</h4><p>" + e(lang, "veh." + v.id + ".desc") + "</p>" +
            '<ul class="vehicle-specs">' +
              "<li>" + icon("users") + e(lang, "veh.seats", { n: v.seats }) + "</li>" +
              "<li>" + icon("bag") + e(lang, "veh.bags", { n: v.bags }) + "</li>" +
              (v.ac ? "<li>" + icon("snow") + e(lang, "veh.ac") + "</li>" : "") +
            "</ul>" +
            '<a class="link-cta" href="#quote" data-quote="transfer" data-vehicle="' + esc(v.id) + '">' + e(lang, "veh.choose") + icon("arrow", "flip-rtl") + "</a>" +
          "</div></article>";
      }).join("") + "</div></div>";
  }

  function activityCard(lang, a, i) {
    var name = t(lang, "act." + a.id + ".name");
    var price = SITE.showPrices && a.price
      ? '<span class="price">' + e(lang, "acts.from") + " <strong>" + esc(a.price) + " " + esc(SITE.currency) + "</strong></span>"
      : "";
    return '<article class="activity-card" data-cat="' + a.category + '">' +
      '<div class="activity-media">' + img(a.image) +
        '<span class="chip chip-cat">' + icon(CAT_ICON[a.category]) + e(lang, "cat." + a.category) + "</span>" +
        '<span class="chip chip-dur"><span class="visually-hidden">' + e(lang, "acts.duration") + (lang === "fr" ? " : " : ": ") + "</span>" + icon("clock") + e(lang, "dur." + a.duration) + "</span>" +
      "</div>" +
      '<div class="activity-body">' +
        "<h3>" + (a.slug ? '<a class="act-link" href="activity/' + esc(a.slug) + '.html">' + esc(name) + "</a>" : esc(name)) + "</h3>" +
        "<p>" + e(lang, "act." + a.id + ".desc") + "</p>" +
        (a.safety ? '<p class="safety">' + icon("shield") + e(lang, "acts.safety") + "</p>" : "") +
        '<div class="activity-foot">' + price +
          (a.slug ? '<a class="map-link" href="activity/' + esc(a.slug) + '.html">' + icon("arrow", "flip-rtl") + e(lang, "act.details") + "</a>" : "") +
          (a.place ? '<button type="button" class="map-link" data-map="' + esc(a.place) + '">' + icon("pin") + e(lang, "acts.onMap") + "</button>" : "") +
          '<a class="btn btn-action btn-sm" href="#quote" data-quote="activity" data-activity="' + esc(name) + '" aria-label="' + e(lang, "acts.ctaAria", { name: name }) + '">' + e(lang, "acts.cta") + "</a>" +
        "</div>" +
      "</div></article>";
  }

  function activities(lang) {
    var filters = ["all"].concat(CATEGORIES);
    return '<section class="section section-band" id="activities" aria-labelledby="acts-title"><div class="container">' +
      '<div class="acts-head">' +
        sectionHead(lang, "acts-title", "acts.title", "acts.lead", "nav.activities") +
        '<div class="filters reveal" role="group" aria-label="' + e(lang, "acts.filterLabel") + '">' + filters.map(function (f) {
          var n = f === "all" ? ACTIVITIES.length : ACTIVITIES.filter(function (a) { return a.category === f; }).length;
          return '<button type="button" data-filter="' + f + '" aria-pressed="' + (f === "all") + '">' +
            (f === "all" ? "" : icon(CAT_ICON[f])) + "<span>" + e(lang, f === "all" ? "acts.all" : "cat." + f) + '</span><span class="count">' + n + "</span></button>";
        }).join("") + "</div>" +
      "</div>" +
      '<p class="visually-hidden" aria-live="polite" id="acts-count"></p>' +
      // one horizontal row you can scroll (arrows on wide screens, swipe on phones)
      '<div class="acts-carousel reveal">' +
        '<div class="activity-grid acts-row" id="acts-grid" role="region" tabindex="0" aria-label="' + e(lang, "acts.title") + '">' +
          ACTIVITIES.map(function (a, i) { return activityCard(lang, a, i); }).join("") + "</div>" +
        '<button type="button" class="car-btn car-prev" data-dir="-1" aria-controls="acts-grid" aria-label="' + e(lang, "acts.prev") + '">' + icon("arrow") + "</button>" +
        '<button type="button" class="car-btn car-next" data-dir="1" aria-controls="acts-grid" aria-label="' + e(lang, "acts.next") + '">' + icon("arrow") + "</button>" +
      "</div>" +
    "</div></section>";
  }

  function mapSection(lang) {
    if (!DESTINATIONS.length) return "";
    var d0 = DESTINATIONS[0];
    return '<section class="section" id="map" aria-labelledby="map-title"><div class="container">' +
      sectionHead(lang, "map-title", "map.title", "map.lead", "map.kicker") +
      '<div class="map-layout">' +
        '<div class="map-frame reveal">' +
          '<iframe id="map-iframe" title="' + e(lang, "map.iframeTitle", { name: destName(lang, d0) }) + '" src="' + esc(mapsEmbed(d0, lang)) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>' +
        "</div>" +
        '<div class="map-side reveal">' +
          '<ul class="dest-list" aria-label="' + e(lang, "map.listLabel") + '">' + DESTINATIONS.map(function (d, i) {
            return '<li><button type="button" class="dest" data-dest="' + esc(d.id) + '" aria-pressed="' + (i === 0) + '">' +
              '<span class="dest-icon">' + icon(d.id === "airport" ? "plane" : "pin") + "</span>" +
              '<span class="dest-text"><strong>' + esc(destName(lang, d)) + "</strong><small>" + esc(destMeta(lang, d)) + "</small></span>" +
              icon("arrow", "dest-arrow flip-rtl") + "</button></li>";
          }).join("") + "</ul>" +
          '<a class="link-cta" id="map-open" href="' + esc(mapsSearch(d0.lat + "," + d0.lng)) + '" target="_blank" rel="noopener">' + icon("map") + e(lang, "map.open") + "</a>" +
        "</div>" +
      "</div>" +
    "</div></section>";
  }

  function why(lang) {
    var items = [["punctual", "clock"], ["drivers", "users"], ["support", "headset"]];
    return '<section class="section section-band" id="why" aria-labelledby="why-title"><div class="container why-layout">' +
      '<div class="why-media reveal">' + img(IMAGES.why, { sizes: "(min-width: 960px) 45vw, 100vw", widths: [480, 800, 1200, 1600], w: 1200, h: 1500 }) +
        '<span class="why-badge">' + icon("compass") + e(lang, "why.badge") + "</span></div>" +
      '<div class="why-content">' +
        sectionHead(lang, "why-title", "why.title", "why.lead", "nav.why") +
        '<ul class="why-list">' + items.map(function (it, i) {
          return '<li class="reveal" style="--d:' + i * 90 + 'ms"><span class="icon-tile">' + icon(it[1]) + "</span>" +
            "<div><h3>" + e(lang, "why." + it[0] + ".title") + "</h3><p>" + e(lang, "why." + it[0] + ".desc") + "</p></div></li>";
        }).join("") + "</ul>" +
      "</div>" +
    "</div></section>";
  }

  function how(lang) {
    var ic = ["mail", "check", "car"];
    return '<section class="section" id="how" aria-labelledby="how-title"><div class="container">' +
      sectionHead(lang, "how-title", "how.title", "how.lead", null, "center") +
      '<ol class="steps">' + [1, 2, 3].map(function (n) {
        return '<li class="reveal" style="--d:' + (n - 1) * 110 + 'ms"><span class="step-num">' + icon(ic[n - 1]) + '<b>' + n + "</b></span>" +
          "<h3>" + e(lang, "how.s" + n + ".title") + "</h3><p>" + e(lang, "how.s" + n + ".desc") + "</p></li>";
      }).join("") + "</ol>" +
    "</div></section>";
  }

  function faqCount() {
    var n = 0;
    while (I18N.fr["faq.q" + (n + 1)] != null) n++;
    return n;
  }
  function faq(lang) {
    var n = faqCount();
    if (!n) return "";
    var items = [];
    for (var i = 1; i <= n; i++) items.push(i);
    return '<section class="section section-band" id="faq" aria-labelledby="faq-title"><div class="container faq-layout">' +
      sectionHead(lang, "faq-title", "faq.title", "faq.lead", "faq.kicker") +
      '<div class="faq-list">' + items.map(function (i) {
        return '<details class="faq-item reveal" style="--d:' + Math.min(i - 1, 4) * 60 + 'ms"' + (i === 1 ? " open" : "") + ">" +
          "<summary><span>" + e(lang, "faq.q" + i) + "</span>" + icon("plus", "faq-icon") + "</summary>" +
          '<div class="faq-answer"><p>' + e(lang, "faq.a" + i) + "</p></div></details>";
      }).join("") + "</div>" +
    "</div></section>";
  }

  function contact(lang) {
    return '<section class="section contact" id="contact" aria-labelledby="contact-title">' +
      '<div class="contact-media">' + img(IMAGES.contact, { sizes: "100vw", widths: [800, 1200, 1600, 2000], w: 2000, h: 1333 }) + "</div>" +
      '<div class="container contact-inner">' +
        '<div class="section-head reveal center">' +
          '<span class="kicker">' + e(lang, "contact.cta") + "</span>" +
          '<h2 id="contact-title">' + e(lang, "contact.title") + "</h2><p>" + e(lang, "contact.lead") + "</p>" +
          '<div class="contact-ctas">' +
            '<a class="btn btn-action btn-lg" href="#quote" data-quote="transfer">' + e(lang, "hero.ctaQuote") + "</a>" +
            '<a class="btn btn-glass btn-lg" href="' + esc(waLink()) + '" target="_blank" rel="noopener">' + icon("whatsapp") + e(lang, "contact.whatsapp") + "</a>" +
          "</div>" +
        "</div>" +
        '<div class="contact-grid reveal">' +
          '<a class="contact-item" href="' + esc(waLink()) + '" target="_blank" rel="noopener">' + icon("whatsapp") +
            "<span><small>" + e(lang, "contact.whatsapp") + '</small><strong dir="ltr">' + esc(SITE.whatsappDisplay) + "</strong></span></a>" +
          (SITE.email ? '<a class="contact-item" href="mailto:' + esc(SITE.email) + '">' + icon("mail") +
            "<span><small>" + e(lang, "contact.email") + '</small><strong dir="ltr">' + esc(SITE.email) + "</strong></span></a>" : "") +
          (SITE.address ? '<a class="contact-item" href="' + esc(SITE.googleBusinessUrl || mapsSearch(SITE.address)) + '" target="_blank" rel="noopener">' + icon("pin") +
            "<span><small>" + e(lang, "contact.address") + "</small><strong>" + esc(SITE.address) + "</strong></span></a>" : "") +
          (SITE.googleBusinessUrl ? '<a class="contact-item" href="' + esc(SITE.googleBusinessUrl) + '" target="_blank" rel="noopener">' + icon("star") +
            "<span><small>" + e(lang, "contact.reviews") + "</small><strong>" + e(lang, "contact.reviewsCta") + "</strong></span></a>" : "") +
        "</div>" +
      "</div>" +
    "</section>";
  }

  function footer(lang) {
    return '<footer class="site-footer"><div class="container">' +
      '<div class="footer-grid">' +
        '<div class="footer-brand"><a class="brand" href="#top">' + brandInner() + "</a>" +
          "<p>" + e(lang, "footer.tagline") + "</p></div>" +
        '<div><h3 class="footer-title">' + e(lang, "footer.explore") + '</h3><ul class="footer-links">' + navLinks(lang) + '<li><a href="#faq">' + e(lang, "nav.faq") + "</a></li></ul></div>" +
        '<div><h3 class="footer-title">' + e(lang, "contact.title") + '</h3><ul class="footer-links">' +
          '<li><a href="' + esc(waLink()) + '" target="_blank" rel="noopener" dir="ltr">' + esc(SITE.whatsappDisplay) + "</a></li>" +
          (SITE.email ? '<li><a href="mailto:' + esc(SITE.email) + '" dir="ltr">' + esc(SITE.email) + "</a></li>" : "") +
          (SITE.address ? "<li>" + esc(SITE.address) + "</li>" : "") + "</ul></div>" +
        '<div><h3 class="footer-title">' + e(lang, "footer.lang") + "</h3>" + langSwitch(lang, "lang-switch-footer") + "</div>" +
      "</div>" +
      '<div class="footer-bottom"><p>© ' + new Date().getFullYear() + " " + esc(SITE.agencyName) + ". " + e(lang, "footer.rights") + ' · <a href="legal.html">' + e(lang, "footer.legal") + "</a></p>" +
        "<p>" + icon("lock") + e(lang, "footer.privacy") + (SITE.goatcounterCode || SITE.cloudflareAnalyticsToken ? " " + e(lang, "footer.stats") : "") + "</p></div>" +
    "</div></footer>" +
    (SITE.demoMode ? '<div class="demo-badge" role="note">' + icon("lock") + "<span>" + e(lang, "demo.badge") + "</span></div>" : "") +
    // Mobile sticky action bar
    '<div class="mobile-bar" aria-hidden="true">' +
      '<a class="btn btn-action" href="#quote" data-quote="transfer" tabindex="-1">' + e(lang, "hero.ctaQuote") + "</a>" +
      '<a class="btn btn-wa" href="' + esc(waLink()) + '" target="_blank" rel="noopener" tabindex="-1">' + icon("whatsapp") + '<span class="visually-hidden">' + e(lang, "contact.waFloat") + "</span></a>" +
    "</div>";
  }

  function renderPage(lang) {
    return header(lang) +
      '<main id="main">' + hero(lang) + services(lang) + activities(lang) + mapSection(lang) + why(lang) + reviews(lang) + how(lang) + faq(lang) + contact(lang) + "</main>" +
      footer(lang);
  }

  var api = {
    renderPage: renderPage, t: t, esc: esc, waLink: waLink,
    reviewCard: reviewCard, reviewsFor: reviewsFor,
    setAssetBase: function (b) { ASSET_BASE = b || ""; },
    formatTrip: formatTrip, faqCount: faqCount,
    mapsEmbed: mapsEmbed, mapsSearch: mapsSearch, mapsRoute: mapsRoute, destName: destName,
    isRtl: function (l) { return RTL_LANGS.indexOf(l) !== -1; }
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Render = api;
})(typeof window !== "undefined" ? window : globalThis);

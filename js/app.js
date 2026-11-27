/* =========================================================
   PAGE BEHAVIOUR: language switch, activity filter, menu,
   quote form (WhatsApp / email). No editing needed here.
   ========================================================= */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var R = window.Render;
  var app = document.getElementById("app");
  var html = document.documentElement;
  var currentLang = DEFAULT_LANG;
  var currentFilter = "all";
  var currentDur = "all";   // duration tab: all | day | multi
  var lastSubmitter = null;

  // Absolute base URL of the site (folder containing css/), used for local images
  (function () {
    var css = document.querySelector('link[href*="css/styles.css"]');
    if (css) R.setAssetBase(css.href.replace(/css\/styles\.css.*$/, ""));
    // keep the tab icon valid after the URL changes on a language switch
    document.querySelectorAll('link[rel~="icon"]').forEach(function (l) { l.setAttribute("href", l.href); });
  })();

  /* ---------- free, cookie-less visitor statistics ---------- */
  (function loadStats() {
    var s;
    if (SITE.goatcounterCode) {
      s = document.createElement("script");
      s.async = true; s.src = "https://gc.zgo.at/count.js";
      s.setAttribute("data-goatcounter", "https://" + SITE.goatcounterCode + ".goatcounter.com/count");
      document.head.appendChild(s);
    } else if (SITE.cloudflareAnalyticsToken) {
      s = document.createElement("script");
      s.defer = true; s.src = "https://static.cloudflareinsights.com/beacon.min.js";
      s.setAttribute("data-cf-beacon", JSON.stringify({ token: SITE.cloudflareAnalyticsToken }));
      document.head.appendChild(s);
    }
  })();
  // Count an action (WhatsApp click, quote sent...). Only GoatCounter records events.
  function track(name) {
    try {
      if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: name, event: true });
    } catch (e) {}
  }
  window.trackEvent = track;

  var demoTimer = null;
  function demoNotice() {
    var n = document.getElementById("demo-toast");
    if (!n) {
      n = document.createElement("div");
      n.id = "demo-toast"; n.className = "demo-toast"; n.setAttribute("role", "status");
      document.body.appendChild(n);
    }
    n.textContent = t("demo.notice");
    n.classList.add("is-visible");
    clearTimeout(demoTimer);
    demoTimer = setTimeout(function () { n.classList.remove("is-visible"); }, 4000);
  }

  /* ---------- light / dark theme ---------- */
  var THEME_COLORS = { light: "#173059", dark: "#0B1324" };
  function savedTheme() { try { var v = localStorage.getItem("theme"); return v === "dark" || v === "light" ? v : null; } catch (e) { return null; } }
  function systemTheme() { return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
  function currentTheme() { return html.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function applyTheme(theme, save) {
    html.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLORS[theme]);
    app.querySelectorAll(".theme-toggle").forEach(function (b) { b.setAttribute("aria-pressed", String(theme === "dark")); });
    if (save) { try { localStorage.setItem("theme", theme); } catch (e) {} }
  }
  // follow the device setting until the visitor makes a choice
  if (window.matchMedia) {
    var mq = matchMedia("(prefers-color-scheme: dark)");
    var onSys = function () { if (!savedTheme()) applyTheme(systemTheme(), false); };
    if (mq.addEventListener) mq.addEventListener("change", onSys); else if (mq.addListener) mq.addListener(onSys);
  }

  function valid(l) { return LANGS.indexOf(l) !== -1; }
  function t(key, vars) { return R.t(currentLang, key, vars); }
  function $(sel) { return app.querySelector(sel); }

  function storageGet() { try { return localStorage.getItem("lang"); } catch (e) { return null; } }
  function storageSet(v) { try { localStorage.setItem("lang", v); } catch (e) {} }

  function initialLang() {
    var q = new URLSearchParams(location.search).get("lang");
    if (valid(q)) return q;
    // Pre-rendered language pages (/ar/, /en/, /es/): the URL decides.
    if (html.hasAttribute("data-prerendered")) return html.lang;
    var s = storageGet();
    return valid(s) ? s : DEFAULT_LANG;
  }

  function todayISO() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  /* ---------- form state survives a language switch ---------- */
  function readForm() {
    var f = $("#quote-form");
    if (!f) return null;
    var data = {};
    Array.prototype.forEach.call(f.elements, function (el) {
      if (!el.name) return;
      if (el.type === "radio") { if (el.checked) data[el.name] = el.value; }
      else if (el.type === "checkbox") data[el.name] = el.checked ? "yes" : "";
      else data[el.name] = el.value;
    });
    var more = $("#q-more"); data.__more = more && more.open ? "1" : "";
    return data;
  }
  function writeForm(data) {
    var f = $("#quote-form");
    if (!f || !data) return;
    Array.prototype.forEach.call(f.elements, function (el) {
      if (!el.name || data[el.name] == null) return;
      if (el.type === "radio") el.checked = el.value === data[el.name];
      else if (el.type === "checkbox") el.checked = data[el.name] === "yes";
      else el.value = data[el.name];
    });
    var more = $("#q-more"); if (more && data.__more) more.open = true;
  }

  /* ---------- language ---------- */
  function updateUrl(lang) {
    var url;
    if (html.hasAttribute("data-prerendered")) {
      // /ar/ -> /en/, / -> /es/ ... (works in a sub-folder too)
      var base = location.pathname.replace(/(?:(?:ar|en|es)\/)?(?:index\.html)?$/, "");
      url = base + (lang === DEFAULT_LANG ? "" : lang + "/") + location.hash;
    } else {
      var p = new URLSearchParams(location.search);
      if (lang === DEFAULT_LANG) p.delete("lang"); else p.set("lang", lang);
      var qs = p.toString();
      url = location.pathname + (qs ? "?" + qs : "") + location.hash;
    }
    try { history.replaceState(null, "", url); } catch (e) {}
  }

  function setLang(lang, opts) {
    opts = opts || {};
    var state = readForm();
    var alreadyRendered = opts.initial && html.hasAttribute("data-prerendered") && html.lang === lang && app.children.length;
    currentLang = lang;
    if (!alreadyRendered) app.innerHTML = R.renderPage(lang);

    html.lang = lang;
    html.dir = R.isRtl(lang) ? "rtl" : "ltr";
    document.title = t("meta.title");
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", t("meta.description"));

    writeForm(state);
    afterRender();
    applyFilter(currentFilter, false);
    updateCarousel();
    setupReveal(!opts.initial);
    onScroll();

    if (!opts.initial) {
      storageSet(lang);
      updateUrl(lang);
      // keep the keyboard focus where the visitor chose the language
      var btn = opts.from === "footer" ? app.querySelector('.lang-switch-footer button[data-lang="' + lang + '"]') : app.querySelector(".lang-menu-btn");
      if (btn) btn.focus({ preventScroll: opts.from !== "footer" });
    }
  }

  function afterRender() {
    var date = $("#q-date");
    if (date) date.min = todayISO();
    syncServiceUI();
    syncRoute();
    updateEstimate();
    updateVehicleHint();
    if (currentDest) selectDest(currentDest);
    applyTheme(currentTheme(), false);
  }

  /* ---------- Google Maps ---------- */
  var currentDest = null;
  function selectDest(id) {
    var d = (window.DESTINATIONS || []).filter(function (x) { return x.id === id; })[0];
    var frame = $("#map-iframe");
    if (!d || !frame) return;
    currentDest = id;
    app.querySelectorAll(".dest").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-dest") === id)); });
    var src = R.mapsEmbed(d, currentLang);
    if (frame.getAttribute("src") !== src) frame.setAttribute("src", src);
    frame.title = t("map.iframeTitle", { name: R.destName(currentLang, d) });
    var open = $("#map-open");
    if (open) open.href = R.mapsSearch(d.lat + "," + d.lng);
  }
  function withCountry(q) { return /maroc|morocco|marruecos|marokko|المغرب/i.test(q) ? q : q + ", Maroc"; }
  function coordsOf(id) {
    var h = $("#" + id + "-coords");
    if (!h || !h.value) return null;
    var p = h.value.split(",").map(Number);
    return p.length === 2 && !isNaN(p[0]) && !isNaN(p[1]) ? { lat: p[0], lng: p[1] } : null;
  }
  function routeUrl() {
    var from = ($("#q-from") || {}).value || "", to = ($("#q-to") || {}).value || "";
    from = from.trim(); to = to.trim();
    if (!from || !to) return "";
    var a = coordsOf("q-from"), b = coordsOf("q-to");
    return R.mapsRoute(a ? a.lat + "," + a.lng : withCountry(from), b ? b.lat + "," + b.lng : withCountry(to));
  }

  /* ---------- free address autocomplete (OpenStreetMap / Photon) ---------- */
  var acTimer = null, acAbort = null, acItems = [], acActive = -1, acInput = null;
  var norm = function (x) { return String(x).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); };

  function localSuggestions(input) {
    var q = norm(input.value.trim());
    var list = [];
    var f = $("#quote-form");
    if (input.id === "q-to" && f && f.service.value === "activity") {
      ACTIVITIES.forEach(function (a) {
        var d = a.place && DESTINATIONS.filter(function (x) { return x.id === a.place; })[0];
        list.push({ name: t("act." + a.id + ".name"), sub: t("cat." + a.category), lat: d ? d.lat : null, lng: d ? d.lng : null, kind: "act" });
      });
    }
    DESTINATIONS.forEach(function (d) {
      list.push({ name: R.destName(currentLang, d), sub: "Marrakech", lat: d.lat, lng: d.lng, kind: d.id === "airport" ? "plane" : "pin" });
    });
    (window.PLACES || []).forEach(function (p) { list.push({ name: p.name, sub: "Marrakech", lat: p.lat, lng: p.lng, kind: "pin" }); });
    if (q) list = list.filter(function (it) { return norm(it.name).indexOf(q) !== -1; });
    return list.slice(0, q ? 4 : 6);
  }

  function remoteSearch(q) {
    if (acAbort) acAbort.abort();
    acAbort = "AbortController" in window ? new AbortController() : null;
    var lang = ["fr", "en", "de", "it"].indexOf(currentLang) !== -1 ? currentLang : "default";
    var url = (window.GEOCODER_URL || "https://photon.komoot.io/api/") + "?q=" + encodeURIComponent(q) +
      "&limit=6&lang=" + lang + "&lat=31.63&lon=-8.0&bbox=-17.2,20.8,-0.9,36.0";
    return fetch(url, acAbort ? { signal: acAbort.signal } : {}).then(function (r) { return r.json(); }).then(function (j) {
      var seen = {};
      return (j.features || []).map(function (ft) {
        var p = ft.properties || {}, c = ft.geometry && ft.geometry.coordinates;
        var name = p.name || [p.housenumber, p.street].filter(Boolean).join(" ") || p.city;
        var sub = [p.name && p.street ? p.street : null, p.district, p.city || p.county, p.country].filter(Boolean)
          .filter(function (v, i, a) { return a.indexOf(v) === i && v !== name; }).slice(0, 3).join(", ");
        return { name: name, sub: sub, lat: c ? c[1] : null, lng: c ? c[0] : null, kind: "osm" };
      }).filter(function (it) {
        var k = norm(it.name + "|" + it.sub);
        if (!it.name || seen[k]) return false;
        seen[k] = 1; return true;
      });
    });
  }

  function acRender(input, items, state) {
    var list = $("#" + input.id + "-list");
    if (!list) return;
    acInput = input; acItems = items; acActive = -1;
    var icons = { act: "map", plane: "plane", pin: "pin", osm: "pin" };
    var html = items.map(function (it, i) {
      return '<li role="option" id="' + input.id + "-opt-" + i + '" data-i="' + i + '" aria-selected="false">' +
        '<svg aria-hidden="true" width="18" height="18"><use href="#i-' + icons[it.kind] + '"/></svg><span><strong>' + R.esc(it.name) + "</strong>" +
        (it.sub ? "<small>" + R.esc(it.sub) + "</small>" : "") + "</span></li>";
    }).join("");
    if (state === "loading") html += '<li class="ac-note" role="presentation">' + R.esc(t("ac.searching")) + "</li>";
    if (state === "none" && !items.length) html += '<li class="ac-note" role="presentation">' + R.esc(t("ac.none")) + "</li>";
    if (state === "remote" || state === "loading") html += '<li class="ac-foot" role="presentation">' + R.esc(t("ac.attrib")) + "</li>";
    list.innerHTML = html;
    var open = !!html;
    list.hidden = !open;
    input.setAttribute("aria-expanded", String(open));
    input.removeAttribute("aria-activedescendant");
  }
  function acClose(input) {
    input = input || acInput;
    if (!input) return;
    var list = $("#" + input.id + "-list");
    if (list) { list.hidden = true; list.innerHTML = ""; }
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    // only cancel the pending search if it belongs to this field
    if (input === acInput) {
      acItems = []; acActive = -1;
      if (acAbort) acAbort.abort();
      clearTimeout(acTimer);
    }
  }
  function acMove(delta) {
    if (!acItems.length || !acInput) return;
    acActive = (acActive + delta + acItems.length) % acItems.length;
    var list = $("#" + acInput.id + "-list");
    list.querySelectorAll('[role="option"]').forEach(function (li, i) { li.setAttribute("aria-selected", String(i === acActive)); });
    var opt = $("#" + acInput.id + "-opt-" + acActive);
    if (opt) { acInput.setAttribute("aria-activedescendant", opt.id); opt.scrollIntoView({ block: "nearest" }); }
  }
  function acPick(i) {
    var it = acItems[i], input = acInput;
    if (!it || !input) return;
    input.value = it.name + (it.kind === "osm" && it.sub ? ", " + it.sub.split(", ").slice(0, 2).join(", ") : "");
    $("#" + input.id + "-coords").value = it.lat != null ? it.lat + "," + it.lng : "";
    setError(input, "");
    acClose(input);
    syncRoute();
    updateEstimate();
  }
  function acOnInput(input) {
    $("#" + input.id + "-coords").value = "";
    var q = input.value.trim();
    var local = localSuggestions(input);
    clearTimeout(acTimer);
    if (q.length < 3) { acRender(input, local); updateEstimate(); return; }
    acRender(input, local, "loading");
    acTimer = setTimeout(function () {
      remoteSearch(q).then(function (remote) {
        if (document.activeElement !== input) return;
        var all = local.concat(remote.filter(function (r) {
          return !local.some(function (l) { return norm(l.name) === norm(r.name); });
        })).slice(0, 7);
        acRender(input, all, remote.length ? "remote" : "none");
      }).catch(function (err) {
        if (err && err.name === "AbortError") return;
        acRender(input, local);
      });
    }, 300);
    updateEstimate();
  }

  /* ---------- free distance / time estimate (OSRM, fallback: straight line) ---------- */
  var tripCache = {}, tripSeq = 0, lastTrip = null;
  function haversineKm(a, b) {
    var R2 = 6371, toR = Math.PI / 180;
    var dLat = (b.lat - a.lat) * toR, dLng = (b.lng - a.lng) * toR;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R2 * Math.asin(Math.sqrt(x));
  }
  function showEstimate(trip) {
    var box = $("#q-estimate");
    if (!box) return;
    lastTrip = trip;
    box.hidden = !trip;
    if (trip) box.querySelector("b").textContent = R.formatTrip(currentLang, trip.km, trip.min) + " " + t("ac.drive");
  }
  function updateEstimate() {
    var a = coordsOf("q-from"), b = coordsOf("q-to");
    if (!a || !b) { tripSeq++; showEstimate(null); return; }
    var key = [a.lat, a.lng, b.lat, b.lng].join(",");
    if (tripCache[key]) { showEstimate(tripCache[key]); return; }
    var seq = ++tripSeq;
    var straight = haversineKm(a, b);
    var fallback = { km: straight * 1.3, min: straight * 1.3 / 55 * 60 + 5 };
    var url = (window.ROUTER_URL || "https://router.project-osrm.org/route/v1/driving/") + a.lng + "," + a.lat + ";" + b.lng + "," + b.lat + "?overview=false";
    fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      if (j.code !== "Ok" || !j.routes || !j.routes[0]) throw new Error("no route");
      var r0 = j.routes[0];
      // the public router is optimistic for city traffic: add a small margin
      tripCache[key] = { km: r0.distance / 1000, min: r0.duration / 60 * 1.15 + 3 };
      if (seq === tripSeq) showEstimate(tripCache[key]);
    }).catch(function () {
      if (seq === tripSeq) showEstimate(fallback);
    });
  }
  function syncRoute() {
    var link = $("#q-route");
    if (!link) return;
    var url = routeUrl();
    link.hidden = !url;
    if (url) link.href = url;
  }

  /* ---------- scroll effects ---------- */
  var revealObserver = null;
  function setupReveal(showAll) {
    var els = app.querySelectorAll(".reveal");
    if (revealObserver) revealObserver.disconnect();
    if (showAll || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); revealObserver.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { revealObserver.observe(el); });
  }

  var ticking = false;
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function onScroll() {
    ticking = false;
    // depth: the hero photo scrolls slower than the page (skipped when motion is reduced)
    var hero = !calm && $(".hero");
    if (hero && window.scrollY <= hero.offsetHeight) hero.style.setProperty("--hero-y", Math.round(window.scrollY));
    var header = $(".site-header");
    if (header) header.classList.toggle("is-top", window.scrollY < 24);
    var bar = $(".mobile-bar");
    var quote = $("#quote");
    if (bar && quote) {
      var r = quote.getBoundingClientRect();
      var quoteVisible = r.bottom > 0 && r.top < window.innerHeight;
      var show = window.scrollY > 400 && !quoteVisible;
      bar.classList.toggle("is-visible", show);
      // Only reachable by keyboard / screen readers while shown
      bar.setAttribute("aria-hidden", String(!show));
      bar.querySelectorAll("a").forEach(function (a) { a.tabIndex = show ? 0 : -1; });
    }
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ---------- activity cards tilt toward the mouse (computers only, not when motion is reduced) ---------- */
  if (!calm && window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var tilted = null;
    var untilt = function () { if (tilted) { tilted.classList.remove("is-tilting"); tilted = null; } };
    document.addEventListener("pointermove", function (ev) {
      var card = ev.target.closest && ev.target.closest(".activity-card");
      if (card !== tilted) untilt();
      if (!card) return;
      var r = card.getBoundingClientRect();
      var x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
      card.style.setProperty("--ry", ((x - .5) * 5).toFixed(2) + "deg");
      card.style.setProperty("--rx", ((.5 - y) * 4).toFixed(2) + "deg");
      card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      card.classList.add("is-tilting"); tilted = card;
    }, { passive: true });
    document.addEventListener("pointerleave", untilt);
  }

  /* ---------- activity filter ---------- */
  function applyFilter(f, announce) {
    currentFilter = f;
    var shown = 0;
    app.querySelectorAll(".filters button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === f));
    });
    app.querySelectorAll(".dur-tabs button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-dur") === currentDur));
    });
    // category counts follow the duration tab; a category with nothing in it is dimmed
    var cards = app.querySelectorAll("#acts-grid .activity-card");
    app.querySelectorAll(".filters button").forEach(function (b) {
      var cat = b.getAttribute("data-filter"), n = 0;
      cards.forEach(function (c) { if ((cat === "all" || c.getAttribute("data-cat") === cat) && (currentDur === "all" || c.getAttribute("data-span") === currentDur)) n++; });
      var cnt = b.querySelector(".count"); if (cnt) cnt.textContent = n;
      b.classList.toggle("is-empty", n === 0);
      b.disabled = n === 0 && cat !== "all";
    });
    cards.forEach(function (c) {
      var show = (f === "all" || c.getAttribute("data-cat") === f) && (currentDur === "all" || c.getAttribute("data-span") === currentDur);
      c.hidden = !show;
      if (show && announce) c.classList.add("is-in");
      if (show) shown++;
    });
    var row = $("#acts-grid");
    if (row && announce) row.scrollTo({ left: 0, behavior: "auto" });
    updateCarousel();
    if (announce) {
      var live = $("#acts-count");
      if (live) live.textContent = t("acts.showing", { n: shown });
    }
  }

  /* ---------- activities row: arrows + their on/off state ---------- */
  function updateCarousel() {
    var row = $("#acts-grid");
    if (!row) return;
    var max = row.scrollWidth - row.clientWidth;
    var x = Math.abs(row.scrollLeft);              // negative in Arabic (right-to-left)
    var prev = app.querySelector(".car-prev"), next = app.querySelector(".car-next");
    if (prev) prev.disabled = x < 4;
    if (next) next.disabled = x > max - 4;
  }
  function scrollCarousel(dir) {
    var row = $("#acts-grid");
    if (!row) return;
    var rtl = document.documentElement.dir === "rtl";
    var step = Math.max(row.clientWidth * 0.9, 260);
    row.scrollBy({ left: dir * step * (rtl ? -1 : 1), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  // scroll events don't bubble: listen in the capture phase so it survives re-renders
  document.addEventListener("scroll", function (ev) { if (ev.target && ev.target.id === "acts-grid") updateCarousel(); }, true);
  window.addEventListener("resize", updateCarousel);
  window.addEventListener("load", updateCarousel);   // once fonts and images have their final size
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateCarousel);

  /* ---------- quote form ---------- */
  function syncServiceUI() {
    var f = $("#quote-form");
    if (!f) return;
    // suggestions for "To" depend on the service (activities when "Activity")
    var to = $("#q-to");
    if (to) to.removeAttribute("list");
    var flight = $("#q-flight-field");
    if (flight) flight.hidden = f.service.value !== "transfer";
    var ret = $("#q-return"), box = $("#q-return-fields");
    if (ret && box) {
      box.hidden = !ret.checked;
      ret.setAttribute("aria-expanded", String(ret.checked));
      var rd = $("#q-rdate"); if (rd) rd.min = $("#q-date").value || todayISO();
    }
  }

  // Suggest a bigger vehicle when the chosen one is too small
  function bestVehicle(pax, bags) {
    return VEHICLES.filter(function (v) { return v.seats >= pax && v.bags >= bags; })[0] || null;
  }
  function updateVehicleHint() {
    var hint = $("#q-veh-hint"), sel = $("#q-veh");
    if (!hint || !sel) return;
    var pax = parseInt($("#q-pax").value, 10) || 0, bags = parseInt(($("#q-bags") || {}).value, 10) || 0;
    var chosen = VEHICLES.filter(function (v) { return v.id === sel.value; })[0];
    var maxSeats = Math.max.apply(null, VEHICLES.map(function (v) { return v.seats; }));
    var text = "", rec = null;
    if (pax > maxSeats) text = t("veh.hintMax", { n: maxSeats });
    else if (chosen && (pax > chosen.seats || bags > chosen.bags)) {
      rec = bestVehicle(pax, bags);
      if (rec) text = t(bags ? "veh.hint" : "veh.hintPax", { n: pax, b: bags, v: t("veh." + rec.id + ".name") });
    }
    hint.hidden = !text;
    hint.querySelector("span").textContent = text;
    var btn = $("#q-veh-switch");
    btn.hidden = !rec;
    if (rec) { btn.textContent = t("veh.hintBtn", { v: t("veh." + rec.id + ".name") }); btn.setAttribute("data-veh", rec.id); }
    if (text) { var more = $("#q-more"); if (more) more.open = true; }
  }

  function openQuote(service, activityName, vehicle) {
    var f = $("#quote-form");
    if (!f) return;
    if (vehicle && $("#q-veh")) { $("#q-veh").value = vehicle; var more = $("#q-more"); if (more) more.open = true; }
    var radio = $("#svc-" + service);
    if (radio) radio.checked = true;
    if (activityName) {
      $("#q-to").value = activityName;
      var act = ACTIVITIES.filter(function (a) { return t("act." + a.id + ".name") === activityName; })[0];
      var d = act && act.place && DESTINATIONS.filter(function (x) { return x.id === act.place; })[0];
      $("#q-to-coords").value = d ? d.lat + "," + d.lng : "";
    }
    syncServiceUI();
    updateVehicleHint();
    syncRoute();
    updateEstimate();
    clearStatus();
    var card = $("#quote");
    card.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    var firstEmpty = ["#q-from", "#q-to", "#q-date", "#q-name"].map($).filter(function (el) { return el && !el.value; })[0];
    (firstEmpty || $("#q-from")).focus({ preventScroll: true });
  }

  function setError(input, msg) {
    var err = document.getElementById(input.id + "-err");
    if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
    if (err) err.textContent = msg || "";
  }

  function setStatus(kind, msg) {
    var s = $("#form-status");
    if (!s) return;
    s.className = "form-status" + (kind ? " is-" + kind : "");
    s.textContent = msg || "";
  }
  function clearStatus() { setStatus("", ""); }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function isPhone(v) { return /^\+?[\d\s().-]{8,}$/.test(v) && v.replace(/\D/g, "").length >= 8; }

  function validate(mode) {
    var firstBad = null;
    function check(sel, msg) {
      var el = $(sel);
      setError(el, msg);
      if (msg && !firstBad) firstBad = el;
    }
    ["#q-from", "#q-to", "#q-name"].forEach(function (sel) {
      check(sel, $(sel).value.trim() ? "" : t("form.errRequired"));
    });
    var d = $("#q-date").value;
    check("#q-date", !d ? t("form.errRequired") : (d < todayISO() ? t("form.errDate") : ""));
    var p = parseInt($("#q-pax").value, 10);
    check("#q-pax", p >= 1 && p <= 60 ? "" : t("form.errRequired"));
    var fl = $("#q-flight");
    if (fl) {
      var fv = fl.value.trim();
      check("#q-flight", fv && !$("#q-flight-field").hidden && !/^[A-Za-z0-9]{2}\s?\d{1,4}[A-Za-z]?$/.test(fv) ? t("form.errFlight") : "");
    }
    if ($("#q-return") && $("#q-return").checked) {
      var rd = $("#q-rdate").value, tm = $("#q-time").value, rt = $("#q-rtime").value;
      var before = rd && d && (rd < d || (rd === d && tm && rt && rt <= tm));
      check("#q-rdate", !rd ? t("form.errRequired") : (before ? t("form.errReturn") : ""));
    } else if ($("#q-rdate")) setError($("#q-rdate"), "");
    var c = $("#q-contact").value.trim();
    var cMsg = "";
    if (!c && mode === "email") cMsg = t("form.errRequired");
    else if (c && !EMAIL_RE.test(c) && !isPhone(c)) cMsg = t("form.errContact");
    check("#q-contact", cMsg);
    return firstBad;
  }

  function collect() {
    var f = $("#quote-form");
    var d = $("#q-date").value;
    var dateText = d;
    try {
      dateText = new Date(d + "T12:00:00").toLocaleDateString(currentLang + (currentLang === "ar" ? "-MA" : ""), { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    } catch (e) {}
    var fmt = function (iso) {
      try { return new Date(iso + "T12:00:00").toLocaleDateString(currentLang + (currentLang === "ar" ? "-MA" : ""), { weekday: "long", year: "numeric", month: "long", day: "numeric" }); }
      catch (e) { return iso; }
    };
    var ret = $("#q-return") && $("#q-return").checked;
    return {
      time: $("#q-time").value,
      flight: f.service.value === "transfer" ? $("#q-flight").value.trim().toUpperCase() : "",
      bags: ($("#q-bags") || {}).value || "",
      kids: (($("#q-kids") || {}).value || "").trim(),
      returnText: ret && $("#q-rdate").value ? fmt($("#q-rdate").value) + ($("#q-rtime").value ? " · " + $("#q-rtime").value : "") : "",
      service: f.service.value,
      serviceLabel: t("svc." + f.service.value),
      from: $("#q-from").value.trim(),
      to: $("#q-to").value.trim(),
      date: d,
      dateText: dateText,
      passengers: $("#q-pax").value,
      vehicle: $("#q-veh") && $("#q-veh").value ? t("veh." + $("#q-veh").value + ".name") : "",
      name: $("#q-name").value.trim(),
      contact: $("#q-contact").value.trim()
    };
  }

  function buildMessage(q) {
    var sep = currentLang === "fr" ? " : " : ": ";
    var lines = [
      t("msg.intro"),
      "",
      "• " + t("form.service") + sep + q.serviceLabel,
      "• " + t("form.from") + sep + q.from,
      "• " + t("form.to") + sep + q.to,
      "• " + t("form.date") + sep + q.dateText + (q.time ? " · " + q.time : ""),
      q.flight ? "• " + t("form.flight") + sep + q.flight : null,
      q.returnText ? "• " + t("msg.return") + sep + q.returnText : null,
      "• " + t("form.passengers") + sep + q.passengers,
      q.bags ? "• " + t("form.bags") + sep + q.bags : null,
      q.kids ? "• " + t("form.kids") + sep + q.kids : null,
      q.vehicle ? "• " + t("form.vehicle") + sep + q.vehicle : null,
      "• " + t("form.name") + sep + q.name
    ];
    lines = lines.filter(function (x) { return x !== null; });
    if (q.contact) lines.push("• " + t("form.contact") + sep + q.contact);
    if (lastTrip && !$("#q-estimate").hidden) lines.push("• " + t("msg.estimate") + sep + R.formatTrip(currentLang, lastTrip.km, lastTrip.min));
    var route = routeUrl();
    if (route) lines.push("• " + t("msg.route") + sep + route);
    return lines.join("\n");
  }

  function submitQuote(mode) {
    var bad = validate(mode);
    if (bad) {
      setStatus("error", t("form.errSummary"));
      bad.focus();
      return;
    }
    var q = collect();
    var message = buildMessage(q);

    if (SITE.demoMode) {
      setStatus("error", t("demo.notice"));
      return;
    }
    track("quote-sent-" + mode + "-" + q.service);
    if (mode === "whatsapp") {
      window.open(R.waLink(message), "_blank", "noopener");
      setStatus("success", t("form.okWa"));
      return;
    }

    var subject = t("msg.subject") + " · " + q.serviceLabel + " · " + q.date;
    if (SITE.formEndpoint) {
      setStatus("", t("form.sending"));
      var payload = {
        subject: subject, name: q.name, contact: q.contact, service: q.serviceLabel,
        from: q.from, to: q.to, date: q.date, passengers: q.passengers, language: currentLang, message: message
      };
      if (SITE.formAccessKey) payload.access_key = SITE.formAccessKey;
      if (EMAIL_RE.test(q.contact)) payload.email = q.contact;
      fetch(SITE.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        setStatus("success", t("form.okEmail"));
      }).catch(function () {
        setStatus("error", t("form.errSend"));
      });
    } else {
      location.href = "mailto:" + SITE.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(message);
      setStatus("success", t("form.okMailto"));
    }
  }

  /* ---------- events (delegated: survive re-renders) ---------- */
  document.addEventListener("click", function (ev) {
    var el = ev.target.closest("button, a");
    if (!el || !app.contains(el)) return;

    // statistics: which actions visitors take
    var href = el.getAttribute("href") || "";
    // demo mode: never contact the placeholder number/email
    if (SITE.demoMode && (/^https:\/\/wa\.me\//.test(href) || /^mailto:/.test(href))) {
      ev.preventDefault();
      demoNotice();
      return;
    }
    if (/^https:\/\/wa\.me\//.test(href)) track("whatsapp-click");
    else if (/^mailto:/.test(href)) track("email-click");
    else if (el.id === "map-open") track("map-open-google");
    else if (el.id === "q-route") track("route-open-google");
    else if (el.matches(".map-link")) track("map-view-" + el.getAttribute("data-map"));
    else if (el.hasAttribute("data-quote")) track("quote-start-" + el.getAttribute("data-quote"));

    if (el.matches(".theme-toggle")) {
      var next = currentTheme() === "dark" ? "light" : "dark";
      applyTheme(next, true);
      track("theme-" + next);
      return;
    }
    if (el.matches(".lang-menu-btn")) { toggleLangMenu(el.getAttribute("aria-expanded") !== "true"); return; }
    if (el.matches(".lang-switch button, .lang-list button")) {
      var l = el.getAttribute("data-lang");
      toggleLangMenu(false);
      if (l !== currentLang) track("language-" + l);
      if (l !== currentLang) setLang(l, { from: el.closest(".lang-switch-footer") ? "footer" : "header" });
      return;
    }
    if (el.matches(".filters button")) { applyFilter(el.getAttribute("data-filter"), true); return; }
    if (el.matches(".dur-tabs button")) {
      currentDur = el.getAttribute("data-dur");
      // if the chosen category has nothing of that length, show all categories
      var keep = currentFilter === "all" || [].some.call(app.querySelectorAll('#acts-grid .activity-card[data-cat="' + currentFilter + '"]'), function (c) { return currentDur === "all" || c.getAttribute("data-span") === currentDur; });
      applyFilter(keep ? currentFilter : "all", true);
      return;
    }
    if (el.matches(".car-btn")) { scrollCarousel(Number(el.getAttribute("data-dir"))); return; }
    if (el.matches(".menu-toggle")) {
      var nav = $("#main-nav");
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      $(".site-header").classList.toggle("menu-open", open);
      el.setAttribute("aria-expanded", String(open));
      return;
    }
    if (el.matches(".main-nav a")) {
      $("#main-nav").classList.remove("is-open");
      $(".site-header").classList.remove("menu-open");
      var tg = $(".menu-toggle"); if (tg) tg.setAttribute("aria-expanded", "false");
    }
    if (el.matches(".dest")) { selectDest(el.getAttribute("data-dest")); return; }
    if (el.matches(".map-link")) {
      selectDest(el.getAttribute("data-map"));
      var sec = $("#map");
      if (sec) sec.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      var btn = app.querySelector('.dest[data-dest="' + el.getAttribute("data-map") + '"]');
      if (btn) btn.focus({ preventScroll: true });
      return;
    }
    if (el.id === "q-veh-switch") {
      $("#q-veh").value = el.getAttribute("data-veh");
      updateVehicleHint();
      $("#q-veh").focus();
      return;
    }
    if (el.hasAttribute("data-quote")) {
      ev.preventDefault();
      openQuote(el.getAttribute("data-quote"), el.getAttribute("data-activity"), el.getAttribute("data-vehicle"));
      return;
    }
    if (el.matches('#quote-form button[type="submit"]')) lastSubmitter = el;
  });

  // header language menu: open/close, close on outside click and Escape
  function toggleLangMenu(open, focusBtn) {
    var btn = $(".lang-menu-btn"), list = $("#lang-list");
    if (!btn || !list) return;
    btn.setAttribute("aria-expanded", String(open));
    list.hidden = !open;
    if (open) { var cur = list.querySelector('[aria-pressed="true"]') || list.querySelector("button"); if (cur) cur.focus(); }
    else if (focusBtn) btn.focus();
  }
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest || !ev.target.closest(".lang-menu")) toggleLangMenu(false);
  }, true);
  document.addEventListener("keydown", function (ev) {
    var list = $("#lang-list");
    if (!list || list.hidden) return;
    var items = Array.prototype.slice.call(list.querySelectorAll("button"));
    var i = items.indexOf(document.activeElement);
    if (ev.key === "Escape") { ev.preventDefault(); toggleLangMenu(false, true); }
    else if (ev.key === "ArrowDown") { ev.preventDefault(); items[(i + 1) % items.length].focus(); }
    else if (ev.key === "ArrowUp") { ev.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    else if (ev.key === "Tab" && i === -1) toggleLangMenu(false);
  });
  document.addEventListener("focusout", function (ev) {
    var menu = $(".lang-menu");
    if (menu && ev.relatedTarget && !menu.contains(ev.relatedTarget)) toggleLangMenu(false);
  });

  // autocomplete: keyboard, focus, mouse
  document.addEventListener("keydown", function (ev) {
    var el = ev.target;
    if (!el || (el.id !== "q-from" && el.id !== "q-to")) return;
    var open = el.getAttribute("aria-expanded") === "true";
    if (ev.key === "ArrowDown") { ev.preventDefault(); if (!open) acRender(el, localSuggestions(el)); acMove(1); }
    else if (ev.key === "ArrowUp" && open) { ev.preventDefault(); acMove(-1); }
    else if (ev.key === "Enter" && open && acActive >= 0) { ev.preventDefault(); acPick(acActive); }
    else if (ev.key === "Escape" && open) { ev.preventDefault(); ev.stopPropagation(); acClose(el); }
    else if (ev.key === "Tab" && open) { acClose(el); }
  }, true);
  document.addEventListener("focusin", function (ev) {
    var el = ev.target;
    if ((el.id === "q-from" || el.id === "q-to") && !el.value.trim()) acRender(el, localSuggestions(el));
  });
  document.addEventListener("focusout", function (ev) {
    var el = ev.target;
    if (el.id === "q-from" || el.id === "q-to") setTimeout(function () { if (document.activeElement !== el) acClose(el); }, 150);
  });
  document.addEventListener("mousedown", function (ev) {
    var li = ev.target.closest && ev.target.closest('.ac-list [role="option"]');
    if (!li) return;
    ev.preventDefault();   // keep focus in the input
    acPick(Number(li.getAttribute("data-i")));
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape") return;
    var nav = $("#main-nav");
    if (nav && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      $(".site-header").classList.remove("menu-open");
      var tg = $(".menu-toggle"); tg.setAttribute("aria-expanded", "false"); tg.focus();
    }
  });

  document.addEventListener("change", function (ev) {
    if (ev.target.name === "service" || ev.target.id === "q-return" || ev.target.id === "q-date") { syncServiceUI(); }
    if (ev.target.id === "q-return" && ev.target.checked) { var rd = $("#q-rdate"); if (rd) rd.focus(); }
    if (ev.target.id === "q-veh" || ev.target.id === "q-pax" || ev.target.id === "q-bags") updateVehicleHint();
  });

  document.addEventListener("input", function (ev) {
    if (ev.target.id === "q-from" || ev.target.id === "q-to") { syncRoute(); acOnInput(ev.target); }
    if (ev.target.id === "q-pax" || ev.target.id === "q-bags") updateVehicleHint();
    if (ev.target.getAttribute && ev.target.getAttribute("aria-invalid") === "true") setError(ev.target, "");
  });

  document.addEventListener("submit", function (ev) {
    if (ev.target.id !== "quote-form") return;
    ev.preventDefault();
    var btn = ev.submitter || lastSubmitter;
    submitQuote(btn && btn.value === "email" ? "email" : "whatsapp");
  });

  setLang(initialLang(), { initial: true });

  // Coming from an activity page ("Request a quote"): prefill the form
  (function prefillFromUrl() {
    var id = new URLSearchParams(location.search).get("activity");
    var a = id && ACTIVITIES.filter(function (x) { return x.id === id; })[0];
    if (a) setTimeout(function () { openQuote("activity", t("act." + a.id + ".name")); }, 60);
  })();
})();

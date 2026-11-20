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
  var THEME_COLORS = { light: "#A13A26", dark: "#15100E" };
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
      else data[el.name] = el.value;
    });
    return data;
  }
  function writeForm(data) {
    var f = $("#quote-form");
    if (!f || !data) return;
    Array.prototype.forEach.call(f.elements, function (el) {
      if (!el.name || data[el.name] == null) return;
      if (el.type === "radio") el.checked = el.value === data[el.name];
      else el.value = data[el.name];
    });
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
    setupReveal(!opts.initial);
    onScroll();

    if (!opts.initial) {
      storageSet(lang);
      updateUrl(lang);
      var btn = app.querySelector('.lang-switch button[data-lang="' + lang + '"]');
      if (btn) btn.focus();
    }
  }

  function afterRender() {
    var date = $("#q-date");
    if (date) date.min = todayISO();
    syncServiceUI();
    syncRoute();
    updateEstimate();
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
    var lang = ["fr", "en", "de"].indexOf(currentLang) !== -1 ? currentLang : "default";
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
        '<svg aria-hidden="true"><use href="#i-' + icons[it.kind] + '"/></svg><span><strong>' + R.esc(it.name) + "</strong>" +
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
  function onScroll() {
    ticking = false;
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

  /* ---------- activity filter ---------- */
  function applyFilter(f, announce) {
    currentFilter = f;
    var shown = 0;
    app.querySelectorAll(".filters button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === f));
    });
    app.querySelectorAll("#acts-grid .activity-card").forEach(function (c) {
      var show = f === "all" || c.getAttribute("data-cat") === f;
      c.hidden = !show;
      if (show && announce) c.classList.add("is-in");
      if (show) shown++;
    });
    if (announce) {
      var live = $("#acts-count");
      if (live) live.textContent = t("acts.showing", { n: shown });
    }
  }

  /* ---------- quote form ---------- */
  function syncServiceUI() {
    var f = $("#quote-form");
    if (!f) return;
    // suggestions for "To" depend on the service (activities when "Activity")
    var to = $("#q-to");
    if (to) to.removeAttribute("list");
  }

  function openQuote(service, activityName) {
    var f = $("#quote-form");
    if (!f) return;
    var radio = $("#svc-" + service);
    if (radio) radio.checked = true;
    if (activityName) {
      $("#q-to").value = activityName;
      var act = ACTIVITIES.filter(function (a) { return t("act." + a.id + ".name") === activityName; })[0];
      var d = act && act.place && DESTINATIONS.filter(function (x) { return x.id === act.place; })[0];
      $("#q-to-coords").value = d ? d.lat + "," + d.lng : "";
    }
    syncServiceUI();
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
    return {
      service: f.service.value,
      serviceLabel: t("svc." + f.service.value),
      from: $("#q-from").value.trim(),
      to: $("#q-to").value.trim(),
      date: d,
      dateText: dateText,
      passengers: $("#q-pax").value,
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
      "• " + t("form.date") + sep + q.dateText,
      "• " + t("form.passengers") + sep + q.passengers,
      "• " + t("form.name") + sep + q.name
    ];
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
    if (el.matches(".lang-switch button")) {
      var l = el.getAttribute("data-lang");
      if (l !== currentLang) track("language-" + l);
      if (l !== currentLang) setLang(l);
      return;
    }
    if (el.matches(".filters button")) { applyFilter(el.getAttribute("data-filter"), true); return; }
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
    if (el.hasAttribute("data-quote")) {
      ev.preventDefault();
      openQuote(el.getAttribute("data-quote"), el.getAttribute("data-activity"));
      return;
    }
    if (el.matches('#quote-form button[type="submit"]')) lastSubmitter = el;
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
    if (ev.target.name === "service") syncServiceUI();
  });

  document.addEventListener("input", function (ev) {
    if (ev.target.id === "q-from" || ev.target.id === "q-to") { syncRoute(); acOnInput(ev.target); }
    if (ev.target.getAttribute && ev.target.getAttribute("aria-invalid") === "true") setError(ev.target, "");
  });

  document.addEventListener("submit", function (ev) {
    if (ev.target.id !== "quote-form") return;
    ev.preventDefault();
    var btn = ev.submitter || lastSubmitter;
    submitQuote(btn && btn.value === "email" ? "email" : "whatsapp");
  });

  setLang(initialLang(), { initial: true });
})();

/* Site search: the magnifier in the header (every page) and the search bar above
   the activities open one search window. Results come from /search/<lang>.json
   (built by build.mjs), downloaded only when the window is first opened. */
(function () {
  "use strict";
  var html = document.documentElement;
  var data = null, dataLang = null, open = false, lastFocus = null;

  function lang() { return (html.getAttribute("lang") || "fr").slice(0, 2); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  // lower case, no accents, no Arabic vowel marks, single spaces
  function norm(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ًͯ-ٰٟ]/g, "")
      .replace(/[إأآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  }
  var ICON = '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/></svg>';
  var X = '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  /* ---------- window ---------- */
  var box = el("div", "srch");
  box.hidden = true;
  box.innerHTML =
    '<div class="srch-backdrop" data-srch-close></div>' +
    '<div class="srch-panel" role="dialog" aria-modal="true">' +
      '<div class="srch-bar">' + ICON +
        '<input type="search" class="srch-input" autocomplete="off" enterkeyhint="search" spellcheck="false">' +
        '<button type="button" class="srch-close" data-srch-close>' + X + "</button></div>" +
      '<div class="srch-body"><p class="srch-status" aria-live="polite"></p><div class="srch-results"></div></div>' +
    "</div>";
  var input = box.querySelector(".srch-input"), results = box.querySelector(".srch-results"), status = box.querySelector(".srch-status");

  function load() {
    var l = lang();
    if (data && dataLang === l) return Promise.resolve(data);
    return fetch("/search/" + l + ".json").then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        d.items.forEach(function (it) { it._t = norm(it.t); it._all = norm(it.t + " " + it.d + " " + it.c + " " + it.k); });
        data = d; dataLang = l; return d;
      });
  }

  function applyUi() {
    var u = data.ui;
    box.querySelector(".srch-panel").setAttribute("aria-label", u.label);
    box.querySelector(".srch-panel").setAttribute("dir", html.getAttribute("dir") || "ltr");
    input.placeholder = u.placeholder;
    input.setAttribute("aria-label", u.label);
    box.querySelector(".srch-close").setAttribute("aria-label", u.close);
  }

  function score(it, words, q) {
    var s = 0;
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (it._all.indexOf(w) < 0) return 0;          // every word must match somewhere
      if (it._t.indexOf(w) === 0) s += 6;
      else if (it._t.indexOf(" " + w) >= 0) s += 4;
      else if (it._t.indexOf(w) >= 0) s += 3;
      else s += 1;
    }
    if (it._t === q) s += 10;
    return s;
  }

  function card(it) {
    var a = el("a", "srch-item");
    a.href = it.u;
    if (it.i) { var img = el("img"); img.src = it.i; img.alt = ""; img.loading = "lazy"; img.width = 72; img.height = 54; a.appendChild(img); }
    else { var ph = el("span", "srch-ph"); ph.innerHTML = ICON; a.appendChild(ph); }
    var txt = el("span", "srch-txt");
    txt.appendChild(el("strong", null, it.t));
    txt.appendChild(el("small", null, it.c + " · " + it.d));
    a.appendChild(txt);
    return a;
  }

  function render() {
    var q = norm(input.value);
    results.innerHTML = "";
    if (!q) {
      status.textContent = "";
      results.appendChild(el("p", "srch-head", data.ui.popular));
      var chips = el("div", "srch-chips");
      data.popular.forEach(function (p) {
        var b = el("button", "srch-chip", p);
        b.type = "button";
        b.addEventListener("click", function () { input.value = p; render(); input.focus(); });
        chips.appendChild(b);
      });
      results.appendChild(chips);
      return;
    }
    var words = q.split(" ");
    var hits = data.items.map(function (it) { return { it: it, s: score(it, words, q) }; })
      .filter(function (h) { return h.s > 0; })
      .sort(function (a, b) { return b.s - a.s; });
    if (!hits.length) {
      status.textContent = data.ui.none.replace("{q}", input.value.trim());
      var wa = el("a", "srch-wa", data.ui.ask);
      wa.href = "https://wa.me/" + data.wa + "?text=" + encodeURIComponent(data.waMsg + " " + input.value.trim());
      wa.target = "_blank"; wa.rel = "noopener";
      results.appendChild(wa);
      return;
    }
    status.textContent = hits.length > 1 ? data.ui.count.replace("{n}", hits.length) : "";
    ["service", "act", "guide"].forEach(function (kind) {
      var group = hits.filter(function (h) { return h.it.g === kind; });
      if (!group.length) return;
      results.appendChild(el("p", "srch-head", data.ui[kind === "act" ? "acts" : kind === "guide" ? "guides" : "services"]));
      group.slice(0, 12).forEach(function (h) { results.appendChild(card(h.it)); });
    });
  }

  function openSearch(prefill) {
    lastFocus = document.activeElement;
    load().then(function () {
      applyUi();
      box.hidden = false;
      html.classList.add("srch-lock");
      requestAnimationFrame(function () { box.classList.add("is-open"); });
      open = true;
      if (typeof prefill === "string") input.value = prefill;
      render();
      input.focus();
    }).catch(function () {});
  }
  function closeSearch() {
    if (!open) return;
    open = false;
    box.classList.remove("is-open");
    html.classList.remove("srch-lock");
    box.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  input.addEventListener("input", render);
  input.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter") { var first = results.querySelector(".srch-item"); if (first) { ev.preventDefault(); first.click(); } }
  });
  box.addEventListener("click", function (ev) {
    if (ev.target.closest("[data-srch-close]")) closeSearch();
    else if (ev.target.closest(".srch-item")) closeSearch();
  });
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest(".search-btn, [data-search-open]");
    if (!t) return;
    ev.preventDefault();
    openSearch("");
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && open) closeSearch();
    // "/" opens the search, as on most sites (not while typing in a field)
    if (ev.key === "/" && !open && !/input|textarea|select/i.test((document.activeElement || {}).tagName || "")) { ev.preventDefault(); openSearch(""); }
  });
  window.addEventListener("pagehide", function () { html.classList.remove("srch-lock"); });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(box); });
  else document.body.appendChild(box);
})();

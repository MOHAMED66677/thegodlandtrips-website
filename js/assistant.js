/* Trip assistant: a "Une question ?" button on every page. Visitors tap suggested
   questions and get instant answers taken from the site (content/assistant.js,
   built into /assistant/<lang>.json). No AI, nothing sent or stored. */
(function () {
  "use strict";
  var html = document.documentElement;
  var data = null, dataLang = null, open = false, topics = [];
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function lang() { return (html.getAttribute("lang") || "fr").slice(0, 2); }
  var CHAT = '<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/><path d="M8.5 10h7M8.5 13.5h4.5"/></svg>';
  var X = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var BACK = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>';

  /* ---------- launcher + panel ---------- */
  var launcher = el("button", "ma-launcher");
  launcher.type = "button";
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "ma-panel");
  launcher.innerHTML = CHAT + '<span class="ma-launcher-label"></span>';

  var panel = el("section", "ma-panel");
  panel.id = "ma-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.innerHTML =
    '<header class="ma-head"><span class="ma-avatar" aria-hidden="true">' + CHAT + '</span>' +
    '<div class="ma-head-text"><strong class="ma-title"></strong><span class="ma-sub"></span></div>' +
    '<button type="button" class="ma-icon ma-restart">' + BACK + '</button>' +
    '<button type="button" class="ma-icon ma-close">' + X + "</button></header>" +
    '<div class="ma-log" aria-live="polite"></div>' +
    '<div class="ma-chips" role="group"></div>' +
    '<p class="ma-privacy"></p>';
  var log = panel.querySelector(".ma-log"), chipsBox = panel.querySelector(".ma-chips");

  // launcher labels (the answers themselves are downloaded only when the chat is opened)
  var LABEL = { fr: "Une question ?", ar: "عندك سؤال؟", en: "Any questions?", es: "¿Alguna pregunta?", de: "Fragen?", nl: "Een vraag?", it: "Domande?" };
  function setLabel() {
    var t = LABEL[lang()] || LABEL.fr;
    launcher.querySelector(".ma-launcher-label").textContent = t;
    launcher.setAttribute("aria-label", t);
  }
  function mount() {
    setLabel();
    document.body.appendChild(launcher);
    document.body.appendChild(panel);
  }

  function load() {
    var l = lang();
    if (data && dataLang === l) return Promise.resolve(data);
    return fetch("/assistant/" + l + ".json").then(function (r) {
      if (!r.ok) throw new Error("assistant " + r.status);
      return r.json();
    }).then(function (d) { data = d; dataLang = l; return d; });
  }

  function applyUi() {
    var u = data.ui;
    panel.setAttribute("aria-label", u.title);
    panel.setAttribute("dir", html.getAttribute("dir") || "ltr");
    panel.querySelector(".ma-title").textContent = u.title;
    panel.querySelector(".ma-sub").textContent = u.subtitle;
    panel.querySelector(".ma-restart").setAttribute("aria-label", u.restart);
    panel.querySelector(".ma-restart").title = u.restart;
    panel.querySelector(".ma-close").setAttribute("aria-label", u.close);
    panel.querySelector(".ma-close").title = u.close;
    panel.querySelector(".ma-privacy").textContent = u.privacy;
    chipsBox.setAttribute("aria-label", u.more);
  }

  function waLink() {
    var text = data.waMsg + (topics.length ? "\n" + data.waTopics + " " + topics.join(", ") : "");
    return "https://wa.me/" + data.wa + "?text=" + encodeURIComponent(text);
  }

  /* ---------- conversation ---------- */
  function scrollDown() { log.scrollTop = log.scrollHeight; }

  function userSays(text) {
    var b = el("div", "ma-msg ma-user", text);
    log.appendChild(b);
    scrollDown();
  }

  function botSays(id) {
    var n = data.nodes[id];
    var b = el("div", "ma-msg ma-bot");
    if (n.say.length > 1) {
      var ul = el("ul", "ma-facts");
      n.say.forEach(function (s) { ul.appendChild(el("li", null, s)); });
      b.appendChild(ul);
    } else {
      b.appendChild(el("p", null, n.say[0]));
    }
    if (n.list && n.list.length) {
      var list = el("ul", "ma-acts");
      n.list.forEach(function (a) {
        var li = el("li"), link = el("a", null, a.t);
        link.href = a.u;
        li.appendChild(link);
        list.appendChild(li);
      });
      b.appendChild(list);
    }
    if (n.links && n.links.length) {
      var row = el("div", "ma-links");
      n.links.forEach(function (l) {
        var a = el("a", "ma-link ma-link-" + (l.k || "page"), l.t);
        if (l.k === "wa") { a.href = waLink(); a.target = "_blank"; a.rel = "noopener"; }
        else a.href = l.u;
        if (l.k === "quote") a.addEventListener("click", function () { close(false); });
        row.appendChild(a);
      });
      b.appendChild(row);
    }
    log.appendChild(b);
    showChips(id);
    // show the start of the answer (with the question just above it), not its end
    var prev = b.previousElementSibling;
    log.scrollTop = Math.max(0, (prev && prev.classList.contains("ma-user") ? prev.offsetTop : b.offsetTop) - 12);
  }

  function showChips(id) {
    var n = data.nodes[id];
    var ids = n.chips.slice();
    if (id !== "start") ids.push("start");
    if (id !== "human" && ids.indexOf("human") < 0) ids.push("human");
    chipsBox.innerHTML = "";
    ids.forEach(function (c) {
      var b = el("button", "ma-chip" + (c === "start" ? " ma-chip-back" : "") + (c === "human" ? " ma-chip-human" : ""),
        c === "start" ? data.ui.more : data.labels[c]);
      b.type = "button";
      b.setAttribute("data-node", c);
      chipsBox.appendChild(b);
    });
  }

  function ask(id) {
    if (!data.nodes[id]) return;
    if (id !== "start") {
      userSays(data.labels[id]);
      if (data.labels[id] && topics.indexOf(data.labels[id]) < 0 && id !== "human" && id !== "practical" && id !== "visit" && id !== "planner") topics.push(data.labels[id]);
    }
    chipsBox.innerHTML = "";
    if (calm) { botSays(id); return; }
    var typing = el("div", "ma-msg ma-bot ma-typing");
    typing.innerHTML = "<span></span><span></span><span></span>";
    log.appendChild(typing);
    scrollDown();
    setTimeout(function () { typing.remove(); botSays(id); }, 450);
  }

  function restart() {
    log.innerHTML = "";
    topics = [];
    ask("start");
  }

  /* ---------- open / close ---------- */
  function openPanel() {
    load().then(function () {
      var fresh = panel.getAttribute("data-lang") !== dataLang;
      applyUi();
      if (fresh) { panel.setAttribute("data-lang", dataLang); restart(); }
      panel.hidden = false;
      requestAnimationFrame(function () { panel.classList.add("is-open"); });
      launcher.setAttribute("aria-expanded", "true");
      launcher.classList.add("is-hidden");
      open = true;
      setTimeout(function () { var c = chipsBox.querySelector(".ma-chip"); if (c) c.focus({ preventScroll: true }); }, calm ? 0 : 500);
    }).catch(function () {
      // the answers could not be loaded (offline...): go straight to WhatsApp
      var num = document.querySelector('a[href^="https://wa.me/"]');
      if (num) window.open(num.href, "_blank", "noopener");
    });
  }
  function close(focusBack) {
    panel.classList.remove("is-open");
    launcher.setAttribute("aria-expanded", "false");
    launcher.classList.remove("is-hidden");
    open = false;
    setTimeout(function () { if (!open) panel.hidden = true; }, calm ? 0 : 250);
    if (focusBack !== false) launcher.focus();
  }

  launcher.addEventListener("click", function () { open ? close() : openPanel(); });
  panel.querySelector(".ma-close").addEventListener("click", function () { close(); });
  panel.querySelector(".ma-restart").addEventListener("click", restart);
  chipsBox.addEventListener("click", function (ev) {
    var b = ev.target.closest(".ma-chip");
    if (b) ask(b.getAttribute("data-node"));
  });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && open) close(); });
  // the home page can change language without reloading: refresh the labels
  new MutationObserver(function () {
    setLabel();
    if (open && lang() !== dataLang) load().then(function () { applyUi(); if (open) { panel.setAttribute("data-lang", dataLang); restart(); } }).catch(function () {});
  }).observe(html, { attributes: true, attributeFilter: ["lang"] });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();

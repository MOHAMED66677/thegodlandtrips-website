// Builds the site for publishing, into the "dist" folder:
//   dist/index.html (French), dist/ar/, dist/en/, dist/es/
// Each page already contains its text, title and description, so search
// engines index every language. Run with:  node build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";

const require = createRequire(import.meta.url);
const { SITE, IMAGES, ACTIVITIES, VEHICLES, DESTINATIONS, GEOCODER_URL, ROUTER_URL } = require("./content/site.js");

// Every Unsplash id must have its local WebP copies (made by tools/photos.py)
const missingPhotos = [...Object.values(IMAGES), ...ACTIVITIES.map((a) => a.image), ...(VEHICLES || []).map((v) => v.image)]
  .filter((id) => /^photo-/.test(id || "") && !existsSync(`images/photos/${id}-800.webp`));
if (missingPhotos.length) {
  console.error(`✗ Photos not downloaded yet: ${missingPhotos.join(", ")}
  Run: python tools/photos.py`);
  process.exit(1);
}
const { LANGS, DEFAULT_LANG, LANG_NAMES, LANG_SHORT } = require("./content/translations.js");
const R = require("./js/render.js");

const OUT = "dist";

// ---------------- Security: Content Security Policy ----------------
// GitHub Pages can't send security headers, so each page carries its policy in a
// <meta> tag. Only the services the site really uses are allowed; inline scripts
// are allowed by their exact SHA-256 fingerprint, so injected code can't run.
const originOf = (u) => { try { return new URL(u).origin; } catch { return ""; } };
function secure(html) {
  const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)]
    // browsers turn Windows line endings (CRLF) into LF before checking the fingerprint
    .map((m) => `'sha256-${createHash("sha256").update(m[1].replace(/\r\n?/g, "\n"), "utf8").digest("base64")}'`);
  const statsScript = [SITE.goatcounterCode && "https://gc.zgo.at", SITE.cloudflareAnalyticsToken && "https://static.cloudflareinsights.com"].filter(Boolean);
  const statsConnect = [SITE.goatcounterCode && `https://${SITE.goatcounterCode}.goatcounter.com`, SITE.cloudflareAnalyticsToken && "https://cloudflareinsights.com"].filter(Boolean);
  const csp = [
    "default-src 'self'",
    ["script-src 'self'", ...hashes, ...statsScript].join(" "),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    ["img-src 'self' data:", ...statsConnect].join(" "),
    ["connect-src 'self'", originOf(GEOCODER_URL), originOf(ROUTER_URL), SITE.formEndpoint && originOf(SITE.formEndpoint), ...statsConnect].filter(Boolean).join(" "),
    "frame-src https://maps.google.com https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
  return html.replace(/<meta charset="utf-8">/, (m) =>
    `${m}\n  <meta http-equiv="Content-Security-Policy" content="${csp}">\n  <meta name="referrer" content="strict-origin-when-cross-origin">`);
}
// Version tags (?v=<content hash>) on CSS/JS files: after each update, browsers
// download the new files instead of reusing old ones from their cache.
const version = (file) => createHash("md5").update(readFileSync(file)).digest("hex").slice(0, 8);
const template = readFileSync("index.html", "utf8")
  .replace(/(href|src)="((?:css|js|content)\/[^"?]+\.(?:css|js))"/g, (m, attr, file) => `${attr}="${file}?v=${version(file)}"`);
const pathFor = (l) => (l === DEFAULT_LANG ? "" : `${l}/`);
const urlFor = (l) => `${SITE.siteUrl}/${pathFor(l)}`;
const OG_LOCALE = { fr: "fr_FR", ar: "ar_MA", en: "en_GB", es: "es_ES", de: "de_DE", nl: "nl_NL" };

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const dir of ["css", "js", "content", "images"]) cpSync(dir, `${OUT}/${dir}`, { recursive: true });

for (const lang of LANGS) {
  const t = (k) => R.esc(R.t(lang, k));
  const prefix = lang === DEFAULT_LANG ? "" : "../";

  const tt = (k) => R.t(lang, k);
  const abs = (p) => `${SITE.siteUrl}/${p}`;

  // ---- Google structured data (schema.org JSON-LD) ----
  const agencyId = `${SITE.siteUrl}/#agency`;
  const offer = (type, name, description) => ({ "@type": "Offer", itemOffered: { "@type": type, name, description } });
  const faqItems = [];
  for (let i = 1; i <= R.faqCount(); i++) {
    faqItems.push({ "@type": "Question", name: tt(`faq.q${i}`), acceptedAnswer: { "@type": "Answer", text: tt(`faq.a${i}`) } });
  }
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TravelAgency",
        "@id": agencyId,
        name: SITE.agencyName,
        url: urlFor(lang),
        logo: abs("images/logo.png"),
        image: abs(`images/og-${lang}.jpg`),
        description: tt("meta.description"),
        telephone: "+" + SITE.whatsapp,
        email: SITE.email || undefined,
        address: { "@type": "PostalAddress", streetAddress: SITE.address || undefined, addressLocality: "Marrakech", addressCountry: "MA" },
        areaServed: { "@type": "City", name: "Marrakech" },
        knowsLanguage: LANGS,
        sameAs: SITE.googleBusinessUrl ? [SITE.googleBusinessUrl] : undefined,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: tt("services.title"),
          itemListElement: [
            offer("Service", tt("services.transfer.title"), tt("services.transfer.desc")),
            offer("Service", tt("services.disposal.title"), tt("services.disposal.desc")),
            ...ACTIVITIES.map((a) => {
              const o = offer("TouristTrip", tt(`act.${a.id}.name`), tt(`act.${a.id}.desc`));
              if (SITE.showPrices && a.price) Object.assign(o, { price: a.price, priceCurrency: SITE.currency });
              return o;
            }),
          ],
        },
      },
      { "@type": "WebSite", "@id": `${SITE.siteUrl}/#website`, url: urlFor(lang), name: SITE.agencyName, inLanguage: lang, publisher: { "@id": agencyId } },
      ...(faqItems.length ? [{ "@type": "FAQPage", inLanguage: lang, mainEntity: faqItems }] : []),
    ],
  };
  const ldJson = JSON.stringify(ld).replace(/</g, "\\u003c");

  const seo = [
    `<link rel="canonical" href="${urlFor(lang)}">`,
    ...LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${urlFor(l)}">`),
    `<link rel="alternate" hreflang="x-default" href="${urlFor(DEFAULT_LANG)}">`,
    ...(SITE.demoMode || SITE.hideFromSearch ? [`<meta name="robots" content="noindex, nofollow">`] : []),
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${t("meta.title")}">`,
    `<meta property="og:description" content="${t("meta.description")}">`,
    `<meta property="og:url" content="${urlFor(lang)}">`,
    `<meta property="og:locale" content="${OG_LOCALE[lang]}">`,
    ...LANGS.filter((l) => l !== lang).map((l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}">`),
    `<meta property="og:site_name" content="${R.esc(SITE.agencyName)}">`,
    `<meta property="og:image" content="${abs(`images/og-${lang}.jpg`)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${t("hero.title")}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${t("meta.title")}">`,
    `<meta name="twitter:description" content="${t("meta.description")}">`,
    `<meta name="twitter:image" content="${abs(`images/og-${lang}.jpg`)}">`,
    `<script type="application/ld+json">${ldJson}</script>`,
  ].join("\n  ");

  let html = template
    .replace(/<html[^>]*>/, `<html lang="${lang}" dir="${R.isRtl(lang) ? "rtl" : "ltr"}" data-prerendered>`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${t("meta.title")}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${t("meta.description")}">`)
    .replace("<!--SEO-->", () => seo)
    .replace("<!--APP-->", () => R.renderPage(lang))
    .replace(/\s*<noscript>[\s\S]*?<\/noscript>/, "")
    .replace(/(href|src)="(css|js|content|images)\//g, `$1="${prefix}$2/`)
    .replace(/srcset="([^"]*)"/g, (m, v) => `srcset="${v.replace(/(^|, )images\//g, `$1${prefix}images/`)}"`);

  const dir = `${OUT}/${pathFor(lang)}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}index.html`, secure(html));
  console.log(`✓ ${dir}index.html`);
}

// ---------------- Legal page: one per language (legal.html) ----------------
const { LEGAL_INFO, LEGAL_TEXT } = require("./content/legal.js");
const sprite = (template.match(/<svg width="0" height="0"[\s\S]*?<\/svg>/) || [""])[0];
const fontsLink = (template.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/) || [""])[0];
const themeScript = (template.match(/<script>\s*\/\* apply the saved theme[\s\S]*?<\/script>/) || [""])[0];
const cssHref = template.match(/href="(css\/styles\.css[^"]*)"/)[1];

for (const lang of LANGS) {
  const L = LEGAL_TEXT[lang];
  const prefix = lang === DEFAULT_LANG ? "" : "../";
  const rtl = R.isRtl(lang);
  const sep = lang === "fr" ? " : " : ": ";   // French puts a space before colons
  const todo = (key) => `<mark class="todo">[${R.esc(L.todo)}${sep}${R.esc(L.labels[key] || key)}]</mark>`;
  const P = SITE.promises || {};
  const clean = (v) => String(v || "").trim().replace(/\.\s*$/, "")
    .replace(/\{wait\}/g, P.freeWaitingMinutes || "").replace(/\{cancel\}/g, P.freeCancellationHours || "");
  const contact = "WhatsApp " + SITE.whatsappDisplay + (SITE.email ? " · " + SITE.email : "");
  const starting = LEGAL_INFO.status !== "company";   // individual setting up the business
  const S = L.starting;
  const values = {
    site: SITE.agencyName, owner: LEGAL_INFO.ownerName,
    // while starting, the owner is the data controller and the city stands for the address
    company: starting ? LEGAL_INFO.ownerName : LEGAL_INFO.companyName, legalForm: LEGAL_INFO.legalForm,
    address: LEGAL_INFO.address || (starting ? LEGAL_INFO.city : ""), rc: LEGAL_INFO.rc, ice: LEGAL_INFO.ice, taxId: LEGAL_INFO.taxId,
    director: LEGAL_INFO.director, license: LEGAL_INFO.tourismLicense, insurance: LEGAL_INFO.insurance,
    cndp: LEGAL_INFO.cndp || (starting ? S.inProgress : ""), contact,
    retention: clean(LEGAL_INFO.retention[lang]), payment: clean(LEGAL_INFO.payment[lang]),
    cancellation: clean(LEGAL_INFO.cancellation[lang]), waiting: clean(LEGAL_INFO.waiting[lang]),
  };
  const fill = (txt) => R.esc(txt).replace(/\{(\w+)\}/g, (m, k) => {
    if (!(k in values)) return m;
    const v = clean(values[k]);
    return v ? `<span${k === "contact" ? ' dir="ltr"' : ""}>${R.esc(v)}</span>` : todo(starting && k === "company" ? "owner" : k);
  });
  const block = (b) => {
    if (typeof b === "string") return `<p>${fill(b)}</p>`;
    if (b.h3) return `<h3>${R.esc(b.h3)}</h3>`;
    if (b.ul) return `<ul>${b.ul.map((x) => `<li>${fill(x)}</li>`).join("")}</ul>`;
    if (b.dl && starting) {
      // individual: owner, status, city, contact (company fields come later)
      const rows = [[S.owner, "{owner}"], [S.status, S.statusValue], [S.city, LEGAL_INFO.city], [b.dl.find((r) => r[1] === "{contact}")[0], "{contact}"]];
      return `<dl class="legal-dl">${rows.map(([dt, dd]) => `<div><dt>${R.esc(dt)}</dt><dd>${fill(dd)}</dd></div>`).join("")}</dl><p class="legal-note">${R.esc(S.note)}</p>`;
    }
    if (b.dl) return `<dl class="legal-dl">${b.dl.map(([dt, dd]) => `<div><dt>${R.esc(dt)}</dt><dd>${fill(dd)}</dd></div>`).join("")}</dl>`;
    return "";
  };
  const legalUrl = (l) => `${SITE.siteUrl}/${pathFor(l)}legal.html`;
  const updated = new Date(LEGAL_INFO.updated + "T12:00:00").toLocaleDateString(lang === "ar" ? "ar-MA" : lang, { year: "numeric", month: "long", day: "numeric" });
  const langLinks = LANGS.map((l) =>
    `<li><a href="${prefix}${pathFor(l)}legal.html" lang="${l}"${l === lang ? ' aria-current="page"' : ""}><span class="lang-code" aria-hidden="true">${R.esc(LANG_SHORT[l])}</span>${R.esc(LANG_NAMES[l])}</a></li>`).join("");

  const page = `<!doctype html>
<html lang="${lang}" dir="${rtl ? "rtl" : "ltr"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${R.esc(L.pageTitle)} | ${R.esc(SITE.agencyName)}</title>
  <meta name="robots" content="noindex, follow">
  <meta name="theme-color" content="#A13A26">
  <link rel="canonical" href="${legalUrl(lang)}">
  ${LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${legalUrl(l)}">`).join("\n  ")}
  <link rel="icon" type="image/svg+xml" href="${prefix}images/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ${fontsLink}
  ${themeScript}
  <link rel="stylesheet" href="${prefix}${cssHref}">
</head>
<body class="legal-body">
  ${sprite}
  <a class="skip-link" href="#legal-main">${R.esc(R.t(lang, "skip"))}</a>
  <header class="legal-header"><div class="container legal-header-inner">
    <a class="brand" href="./"><img class="brand-logo" src="${prefix}images/logo-mark.svg" alt="" width="36" height="40"><span class="brand-name">${(SITE.brandParts || [[SITE.agencyName, "strong"]]).map((p) => `<span class="bp-${p[1]}">${R.esc(p[0])}</span>`).join("")}</span></a>
    <nav class="lang-menu" aria-label="${R.esc(R.t(lang, "lang.label"))}"><button type="button" class="lang-menu-btn" aria-expanded="false" aria-controls="lang-list"><svg aria-hidden="true" width="20" height="20"><use href="#i-globe"/></svg><span class="lang-current" aria-hidden="true">${R.esc(LANG_SHORT[lang])}</span><span class="visually-hidden">${R.esc(R.t(lang, "lang.label"))} (${R.esc(LANG_NAMES[lang])})</span><svg class="lang-chevron" aria-hidden="true" width="16" height="16"><use href="#i-chevron"/></svg></button><ul class="lang-list" id="lang-list" hidden>${langLinks}</ul></nav>
    <button type="button" class="theme-toggle" aria-pressed="false" aria-label="${R.esc(R.t(lang, "theme.dark"))}"><svg class="i-moon" aria-hidden="true" width="22" height="22"><use href="#i-moon"/></svg><svg class="i-sun" aria-hidden="true" width="22" height="22"><use href="#i-sun"/></svg></button>
  </div></header>
  <main id="legal-main" class="container legal-main">
    <a class="link-cta legal-back" href="./"><svg class="flip-rtl" aria-hidden="true" width="18" height="18" style="transform:${rtl ? "none" : "scaleX(-1)"}"><use href="#i-arrow"/></svg>${R.esc(L.back)}</a>
    <h1>${R.esc(L.pageTitle)}</h1>
    <p class="legal-intro">${fill(L.intro)}</p>
    <p class="legal-updated">${R.esc(L.updated)}${sep}${R.esc(updated)}</p>
    <nav class="legal-toc" aria-label="${R.esc(L.toc)}"><p>${R.esc(L.toc)}</p><ol>${L.sections.map((s) => `<li><a href="#${s.id}">${R.esc(s.title.replace(/^\d+\.\s*/, ""))}</a></li>`).join("")}</ol></nav>
    ${L.sections.map((s) => `<section id="${s.id}" aria-labelledby="${s.id}-t"><h2 id="${s.id}-t">${R.esc(s.title)}</h2>${s.blocks.map(block).join("")}</section>`).join("\n    ")}
  </main>
  <footer class="site-footer legal-footer"><div class="container footer-bottom">
    <p>© ${new Date().getFullYear()} ${R.esc(SITE.agencyName)}. ${R.esc(R.t(lang, "footer.rights"))}</p>
    <p><a href="./">${R.esc(L.back)}</a></p>
  </div></footer>
  <script>
    (function () {
      var html = document.documentElement, btn = document.querySelector(".theme-toggle"), meta = document.querySelector('meta[name="theme-color"]');
      function apply(t, save) {
        html.setAttribute("data-theme", t);
        btn.setAttribute("aria-pressed", String(t === "dark"));
        if (meta) meta.setAttribute("content", t === "dark" ? "#15100E" : "#A13A26");
        if (save) { try { localStorage.setItem("theme", t); } catch (e) {} }
      }
      apply(html.getAttribute("data-theme") === "dark" ? "dark" : "light", false);
      btn.addEventListener("click", function () { apply(html.getAttribute("data-theme") === "dark" ? "light" : "dark", true); });
      var lb = document.querySelector(".lang-menu-btn"), ll = document.getElementById("lang-list");
      function menu(open) { lb.setAttribute("aria-expanded", String(open)); ll.hidden = !open; if (open) { var c = ll.querySelector("[aria-current]"); if (c) c.focus(); } }
      lb.addEventListener("click", function () { menu(lb.getAttribute("aria-expanded") !== "true"); });
      document.addEventListener("click", function (e) { if (!e.target.closest(".lang-menu")) menu(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !ll.hidden) { menu(false); lb.focus(); } });
    })();
  </script>
</body>
</html>
`;
  writeFileSync(`${OUT}/${pathFor(lang)}legal.html`, secure(page));
  console.log(`✓ ${OUT}/${pathFor(lang)}legal.html`);
}

// ---------------- Activity pages: one per activity and language ----------------
// /activity/<slug>.html (French) and /<lang>/activity/<slug>.html
const actUrl = (l, a) => `${SITE.siteUrl}/${pathFor(l)}activity/${a.slug}.html`;
// Unsplash ids point to the WebP copies made by tools/photos.py
const photo = (up, id, w, ext = "webp") => `${up}images/photos/${id}-${w}.${ext}`;
const CAT_ICON = { excursions: "map", land: "mountain", air: "wind", sea: "waves" };
const ic = (n, cls = "", s = 20) => `<svg aria-hidden="true" width="${s}" height="${s}"${cls ? ` class="${cls}"` : ""}><use href="#i-${n}"/></svg>`;
const PAGE_SCRIPT = `(function () {
  var html = document.documentElement, btn = document.querySelector(".theme-toggle"), meta = document.querySelector('meta[name="theme-color"]');
  function apply(t, save) {
    html.setAttribute("data-theme", t);
    btn.setAttribute("aria-pressed", String(t === "dark"));
    if (meta) meta.setAttribute("content", t === "dark" ? "#15100E" : "#A13A26");
    if (save) { try { localStorage.setItem("theme", t); } catch (e) {} }
  }
  apply(html.getAttribute("data-theme") === "dark" ? "dark" : "light", false);
  btn.addEventListener("click", function () { apply(html.getAttribute("data-theme") === "dark" ? "light" : "dark", true); });
  var lb = document.querySelector(".lang-menu-btn"), ll = document.getElementById("lang-list");
  function menu(open) { lb.setAttribute("aria-expanded", String(open)); ll.hidden = !open; if (open) { var c = ll.querySelector("[aria-current]"); if (c) c.focus(); } }
  lb.addEventListener("click", function () { menu(lb.getAttribute("aria-expanded") !== "true"); });
  document.addEventListener("click", function (e) { if (!e.target.closest(".lang-menu")) menu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !ll.hidden) { menu(false); lb.focus(); } });
})();`;
let actCount = 0;
for (const lang of LANGS) {
  const t = (k, v) => R.t(lang, k, v), e = (k, v) => R.esc(R.t(lang, k, v));
  const up = lang === DEFAULT_LANG ? "../" : "../../";     // to the site root (css/, images/)
  const home = "../";                                       // home page in this language
  const rtl = R.isRtl(lang);
  const sep = lang === "fr" ? " : " : ": ";
  mkdirSync(`${OUT}/${pathFor(lang)}activity`, { recursive: true });
  for (const a of ACTIVITIES) {
    if (!a.slug) continue;
    const name = t(`act.${a.id}.name`);
    const dest = a.place && DESTINATIONS.find((d) => d.id === a.place);
    const isPhoto = a.image && /^photo-/.test(a.image);
    const imgSrc = isPhoto ? photo(up, a.image, 1200) : (a.image ? up + a.image : "");
    const imgSet = isPhoto ? [800, 1200, 1600].map((w) => `${photo(up, a.image, w)} ${w}w`).join(", ") : "";
    const P = SITE.promises || {};
    const included = ["inc.pickup", "inc.vehicle", ...(a.safety ? ["inc.safety", "inc.instructor"] : [])];
    const info = [
      ["clock", "info.duration", t(`dur.${a.duration}`)],
      ["pin", "info.departure", t("info.departureValue")],
      ...(dest && dest.km ? [["car", "info.distance", R.formatTrip(lang, dest.km, dest.minutes)]] : []),
      ["check", "info.price", SITE.showPrices && a.price ? `${t("acts.from")} ${a.price} ${SITE.currency}` : t("info.priceQuote")],
      ...(P.freeCancellationHours ? [["calendar", "info.cancel", t("info.cancelValue")]] : []),
    ];
    const others = ACTIVITIES.filter((o) => o.id !== a.id && o.slug && o.category === a.category)
      .concat(ACTIVITIES.filter((o) => o.id !== a.id && o.slug && o.category !== a.category)).slice(0, 3);
    const quoteHref = `${home}?activity=${a.id}#quote`;
    const waHref = R.waLink(`${t("msg.intro")} ${name}`);
    const title = `${name}${lang === "ar" ? "، مراكش" : ", Marrakech"} | ${SITE.agencyName}`;
    const desc = `${t(`act.${a.id}.desc`)} ${t("page.metaTail")}`;
    const ogImg = isPhoto ? photo(`${SITE.siteUrl}/`, a.image, 1200, "jpg") : `${SITE.siteUrl}/images/og-${lang}.jpg`;
    const ld = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "TouristTrip", name, description: t(`act.${a.id}.long`), image: isPhoto ? photo(`${SITE.siteUrl}/`, a.image, 1200, "jpg") : undefined,
          url: actUrl(lang, a), inLanguage: lang, touristType: t(`cat.${a.category}`),
          provider: { "@type": "TravelAgency", name: SITE.agencyName, url: urlFor(lang) },
          ...(SITE.showPrices && a.price ? { offers: { "@type": "Offer", price: a.price, priceCurrency: SITE.currency } } : {}) },
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: t("page.home"), item: urlFor(lang) },
          { "@type": "ListItem", position: 2, name: t("nav.activities"), item: `${urlFor(lang)}#activities` },
          { "@type": "ListItem", position: 3, name, item: actUrl(lang, a) } ] },
      ],
    };
    const langLinks = LANGS.map((l) => `<li><a href="${up}${pathFor(l)}activity/${a.slug}.html" lang="${l}"${l === lang ? ' aria-current="page"' : ""}><span class="lang-code" aria-hidden="true">${R.esc(LANG_SHORT[l])}</span>${R.esc(LANG_NAMES[l])}</a></li>`).join("");
    const page = `<!doctype html>
<html lang="${lang}" dir="${rtl ? "rtl" : "ltr"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${R.esc(title)}</title>
  <meta name="description" content="${R.esc(desc)}">
  ${SITE.demoMode || SITE.hideFromSearch ? '<meta name="robots" content="noindex, nofollow">' : ""}
  <meta name="theme-color" content="#A13A26">
  <link rel="canonical" href="${actUrl(lang, a)}">
  ${LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${actUrl(l, a)}">`).join("\n  ")}
  <link rel="alternate" hreflang="x-default" href="${actUrl(DEFAULT_LANG, a)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${R.esc(title)}">
  <meta property="og:description" content="${R.esc(desc)}">
  <meta property="og:url" content="${actUrl(lang, a)}">
  <meta property="og:image" content="${R.esc(ogImg)}">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
  <link rel="icon" type="image/svg+xml" href="${up}images/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ${fontsLink}
  ${themeScript}
  <link rel="stylesheet" href="${up}${cssHref}">
</head>
<body class="act-body">
  ${sprite}
  <a class="skip-link" href="#main">${e("skip")}</a>
  <header class="legal-header"><div class="container legal-header-inner">
    <a class="brand" href="${home}"><img class="brand-logo" src="${up}images/logo-mark.svg" alt="" width="36" height="40"><span class="brand-name">${(SITE.brandParts || [[SITE.agencyName, "strong"]]).map((p) => `<span class="bp-${p[1]}">${R.esc(p[0])}</span>`).join("")}</span></a>
    <nav class="lang-menu" aria-label="${e("lang.label")}"><button type="button" class="lang-menu-btn" aria-expanded="false" aria-controls="lang-list">${ic("globe")}<span class="lang-current" aria-hidden="true">${R.esc(LANG_SHORT[lang])}</span><span class="visually-hidden">${e("lang.label")} (${R.esc(LANG_NAMES[lang])})</span>${ic("chevron", "lang-chevron", 16)}</button><ul class="lang-list" id="lang-list" hidden>${langLinks}</ul></nav>
    <button type="button" class="theme-toggle" aria-pressed="false" aria-label="${e("theme.dark")}">${ic("moon", "i-moon", 22)}${ic("sun", "i-sun", 22)}</button>
  </div></header>
  <main id="main">
    <section class="act-hero">
      ${imgSrc ? `<img class="act-hero-img" src="${R.esc(imgSrc)}"${imgSet ? ` srcset="${R.esc(imgSet)}" sizes="100vw"` : ""} alt="" width="2000" height="1333" fetchpriority="high">` : ""}
      <div class="container act-hero-inner">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="${home}">${e("page.home")}</a><span aria-hidden="true">›</span><a href="${home}#activities">${e("nav.activities")}</a><span aria-hidden="true">›</span><span aria-current="page">${R.esc(name)}</span></nav>
        <h1>${R.esc(name)}</h1>
        <p class="lead">${e(`act.${a.id}.desc`)}</p>
        <ul class="act-badges">
          <li>${ic(CAT_ICON[a.category], "", 16)}${e(`cat.${a.category}`)}</li>
          <li>${ic("clock", "", 16)}${e(`dur.${a.duration}`)}</li>
          ${a.safety ? `<li>${ic("shield", "", 16)}${e("acts.safety")}</li>` : ""}
        </ul>
        <a class="btn btn-action btn-lg" href="${quoteHref}">${e("acts.cta")}</a>
      </div>
    </section>
    <div class="container act-layout">
      <article class="act-main">
        <p class="act-long">${e(`act.${a.id}.long`)}</p>
        <h2>${e("page.included")}</h2>
        <ul class="inc-list">${included.map((k) => `<li>${ic("check", "", 18)}<span>${e(k)}</span></li>`).join("")}</ul>
        ${dest ? `<h2>${e("page.map")}</h2>
        <div class="map-frame act-map"><iframe title="${e("map.iframeTitle", { name: R.destName(lang, dest) })}" src="${R.esc(R.mapsEmbed(dest, lang))}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>` : ""}
      </article>
      <aside class="act-side">
        <div class="act-card">
          <h2>${e("page.info")}</h2>
          <dl class="act-info">${info.map(([i, k, v]) => `<div>${ic(i, "", 20)}<dt>${e(k)}</dt><dd>${R.esc(v)}</dd></div>`).join("")}</dl>
          <h3>${e("page.ctaTitle")}</h3>
          <p>${e("page.ctaText")}</p>
          <a class="btn btn-action btn-block" href="${quoteHref}">${e("acts.cta")}</a>
          <a class="btn btn-quiet btn-block" href="${R.esc(waHref)}" target="_blank" rel="noopener">${ic("whatsapp")}${e("contact.whatsapp")}</a>
        </div>
      </aside>
    </div>
    <section class="section section-band act-others"><div class="container">
      <h2>${e("page.others")}</h2>
      <div class="activity-grid">${others.map((o) => `<article class="activity-card is-in">
        <div class="activity-media">${/^photo-/.test(o.image || "") ? `<img src="${photo(up, o.image, 800)}" srcset="${[480, 800, 1200].map((w) => `${photo(up, o.image, w)} ${w}w`).join(", ")}" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" alt="" loading="lazy" decoding="async" width="800" height="600">` : ""}<span class="chip chip-cat">${ic(CAT_ICON[o.category], "", 15)}${e(`cat.${o.category}`)}</span><span class="chip chip-dur">${ic("clock", "", 15)}${e(`dur.${o.duration}`)}</span></div>
        <div class="activity-body"><h3><a class="act-link" href="${o.slug}.html">${e(`act.${o.id}.name`)}</a></h3><p>${e(`act.${o.id}.desc`)}</p>
        <div class="activity-foot"><a class="map-link" href="${o.slug}.html">${ic("arrow", "flip-rtl", 17)}${e("act.details")}</a></div></div></article>`).join("")}</div>
    </div></section>
  </main>
  <footer class="site-footer legal-footer"><div class="container footer-bottom">
    <p>© ${new Date().getFullYear()} ${R.esc(SITE.agencyName)}. ${e("footer.rights")}</p>
    <p><a href="${home}legal.html">${e("footer.legal")}</a> · <a href="${home}">${e("page.home")}</a></p>
  </div></footer>
  <script>${PAGE_SCRIPT}</script>
</body>
</html>
`;
    writeFileSync(`${OUT}/${pathFor(lang)}activity/${a.slug}.html`, secure(page));
    actCount++;
  }
}
console.log(`✓ ${actCount} activity pages`);

const today = new Date().toISOString().slice(0, 10);
writeFileSync(`${OUT}/sitemap.xml`,
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LANGS.map((l) => `  <url>
    <loc>${urlFor(l)}</loc>
    <lastmod>${today}</lastmod>
${LANGS.map((a) => `    <xhtml:link rel="alternate" hreflang="${a}" href="${urlFor(a)}"/>`).join("\n")}
  </url>`).join("\n")}
${ACTIVITIES.filter((a) => a.slug).flatMap((act) => LANGS.map((l) => `  <url>
    <loc>${actUrl(l, act)}</loc>
    <lastmod>${today}</lastmod>
${LANGS.map((x) => `    <xhtml:link rel="alternate" hreflang="${x}" href="${actUrl(x, act)}"/>`).join("\n")}
  </url>`)).join("\n")}
</urlset>
`);
writeFileSync(`${OUT}/robots.txt`, SITE.demoMode || SITE.hideFromSearch
  ? `# Hidden from search engines until the official launch (hideFromSearch)\nUser-agent: *\nDisallow: /\n`
  : `User-agent: *\nAllow: /\nSitemap: ${SITE.siteUrl}/sitemap.xml\n`);

// Netlify: security headers + caching
writeFileSync(`${OUT}/_headers`, `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: camera=(), microphone=(), geolocation=()
/images/*
  Cache-Control: public, max-age=604800
/css/*
  Cache-Control: public, max-age=3600
/js/*
  Cache-Control: public, max-age=3600
/content/*
  Cache-Control: public, max-age=3600
`);

// "Page not found" page, in the 4 languages (absolute links: it can be shown at any depth)
const BASE = new URL(SITE.siteUrl + "/").pathname;   // "/" or "/repo-name/" on GitHub Pages
const nf = (l) => `<p lang="${l}"${R.isRtl(l) ? ' dir="rtl"' : ""}><a href="${BASE}${pathFor(l)}">${R.esc(R.t(l, "nav.home") || "")}</a></p>`;
writeFileSync(`${OUT}/404.html`, secure(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>404 | ${R.esc(SITE.agencyName)}</title><meta name="robots" content="noindex"><link rel="icon" type="image/svg+xml" href="${BASE}images/favicon.svg">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#FBF6F3;color:#2B1915;font-family:system-ui,sans-serif;text-align:center;padding:24px}
img{width:72px;margin:0 auto 12px}h1{font-size:2.4rem;margin:.2em 0}p{margin:.4em 0;font-size:1.1rem}a{color:#A13A26;font-weight:600}</style></head>
<body><main><img src="${BASE}images/logo-mark.svg" alt=""><h1>404</h1>${LANGS.map(nf).join("")}</main></body></html>
`));

// security.txt: how to report a security problem (used at the domain root once a custom domain is set)
mkdirSync(`${OUT}/.well-known`, { recursive: true });
const expires = new Date(Date.now() + 365 * 864e5).toISOString().replace(/\.\d+Z$/, "Z");
writeFileSync(`${OUT}/.well-known/security.txt`, [
  `Contact: ${SITE.email ? "mailto:" + SITE.email : "https://wa.me/" + SITE.whatsapp}`,
  `Expires: ${expires}`,
  "Preferred-Languages: fr, en, ar, es",
  `Canonical: ${SITE.siteUrl}/.well-known/security.txt`,
  "",
].join("\n"));
console.log(`✓ ${OUT}/sitemap.xml, ${OUT}/robots.txt\nDone. Upload the "${OUT}" folder to your host.`);

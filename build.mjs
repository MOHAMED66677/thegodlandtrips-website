// Builds the site for publishing, into the "dist" folder:
//   dist/index.html (French), dist/ar/, dist/en/, dist/es/
// Each page already contains its text, title and description, so search
// engines index every language. Run with:  node build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";

const require = createRequire(import.meta.url);
const { SITE, ACTIVITIES } = require("./content/site.js");
const { LANGS, DEFAULT_LANG, LANG_NAMES, LANG_SHORT } = require("./content/translations.js");
const R = require("./js/render.js");

const OUT = "dist";
// Version tags (?v=<content hash>) on CSS/JS files: after each update, browsers
// download the new files instead of reusing old ones from their cache.
const version = (file) => createHash("md5").update(readFileSync(file)).digest("hex").slice(0, 8);
const template = readFileSync("index.html", "utf8")
  .replace(/(href|src)="((?:css|js|content)\/[^"?]+\.(?:css|js))"/g, (m, attr, file) => `${attr}="${file}?v=${version(file)}"`);
const pathFor = (l) => (l === DEFAULT_LANG ? "" : `${l}/`);
const urlFor = (l) => `${SITE.siteUrl}/${pathFor(l)}`;
const OG_LOCALE = { fr: "fr_FR", ar: "ar_MA", en: "en_GB", es: "es_ES" };

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
    .replace(/(href|src)="(css|js|content|images)\//g, `$1="${prefix}$2/`);

  const dir = `${OUT}/${pathFor(lang)}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}index.html`, html);
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
  const clean = (v) => String(v || "").trim().replace(/\.\s*$/, "");
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
    `<a href="${prefix}${pathFor(l)}legal.html" lang="${l}"${l === lang ? ' aria-current="page"' : ""} title="${R.esc(LANG_NAMES[l])}"><span aria-hidden="true">${R.esc(LANG_SHORT[l])}</span><span class="visually-hidden">${R.esc(LANG_NAMES[l])}</span></a>`).join("");

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
    <nav class="lang-switch lang-links" aria-label="${R.esc(R.t(lang, "lang.label"))}">${langLinks}</nav>
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
    })();
  </script>
</body>
</html>
`;
  writeFileSync(`${OUT}/${pathFor(lang)}legal.html`, page);
  console.log(`✓ ${OUT}/${pathFor(lang)}legal.html`);
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(`${OUT}/sitemap.xml`,
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LANGS.map((l) => `  <url>
    <loc>${urlFor(l)}</loc>
    <lastmod>${today}</lastmod>
${LANGS.map((a) => `    <xhtml:link rel="alternate" hreflang="${a}" href="${urlFor(a)}"/>`).join("\n")}
  </url>`).join("\n")}
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
writeFileSync(`${OUT}/404.html`, `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>404 | ${R.esc(SITE.agencyName)}</title><meta name="robots" content="noindex"><link rel="icon" type="image/svg+xml" href="${BASE}images/favicon.svg">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#FBF6F3;color:#2B1915;font-family:system-ui,sans-serif;text-align:center;padding:24px}
img{width:72px;margin:0 auto 12px}h1{font-size:2.4rem;margin:.2em 0}p{margin:.4em 0;font-size:1.1rem}a{color:#A13A26;font-weight:600}</style></head>
<body><main><img src="${BASE}images/logo-mark.svg" alt=""><h1>404</h1>${LANGS.map(nf).join("")}</main></body></html>
`);
console.log(`✓ ${OUT}/sitemap.xml, ${OUT}/robots.txt\nDone. Upload the "${OUT}" folder to your host.`);

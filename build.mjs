// Builds the site for publishing, into the "dist" folder:
//   dist/index.html (French), dist/ar/, dist/en/, dist/es/
// Each page already contains its text, title and description, so search
// engines index every language. Run with:  node build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";

const require = createRequire(import.meta.url);
const { SITE, ACTIVITIES } = require("./content/site.js");
const { LANGS, DEFAULT_LANG } = require("./content/translations.js");
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

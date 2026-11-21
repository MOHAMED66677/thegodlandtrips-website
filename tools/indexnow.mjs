// Tells Bing (and the other IndexNow search engines) about every page in the sitemap.
// Run after publishing:   node tools/indexnow.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { SITE } = require("../content/site.js");

const host = new URL(SITE.siteUrl).host;
const xml = await (await fetch(`${SITE.siteUrl}/sitemap.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key: SITE.indexNowKey, keyLocation: `${SITE.siteUrl}/${SITE.indexNowKey}.txt`, urlList }),
});
console.log(`IndexNow: sent ${urlList.length} pages -> HTTP ${res.status} ${res.statusText}`);

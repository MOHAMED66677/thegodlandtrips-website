# Build plan: tourism and transfers website

Based on the *Cahier des charges – Site Tourisme et Transferts* (Nov 19, 2026).

## Technical choices

| Topic | Choice | Why |
|---|---|---|
| Stack | Static site: HTML + CSS + vanilla JS, no framework | One page, fast on mobile, easy to host, and the agency can edit it without tooling |
| Content | `content/i18n/{fr,ar,en,es}.json` for all text, `content/activities.json` for the 13 activities, `content/site.json` for agency info (name, WhatsApp, email, airports) | Adding an activity or changing a price means editing one data file, not the HTML (spec §4, §10) |
| Languages | JS switcher swaps text in place, no reload. Sets `<html lang dir>` and updates `<title>` and meta description. The choice is kept in the URL (`?lang=ar`) and `localStorage` | Spec §5, §9 |
| SEO | A small Node script pre-renders `/`, `/ar/`, `/en/`, `/es/` from the same JSON, with `hreflang` links and a title and description per language | Search engines see real text in each language (spec §9) |
| RTL | CSS logical properties (`margin-inline-start`, etc.) throughout, so Arabic flips the layout without separate CSS; Cairo font for `lang="ar"` | Spec §5 |
| Design | Every color is a CSS variable in one `:root` block (#0B5563, #F0A63A, #12303A, #4A6670, #F6F9FA, #E8F1F2). Inter, Space Grotesk and Cairo fonts | "Change each color in one place" (spec §6) |
| Quote form | On submit, open WhatsApp (`wa.me`) with the request already typed out, plus an email option through a form service (Formspree or Web3Forms) or a `mailto` fallback. Visitor sees a confirmation either way | No backend to run; meets spec §7 and §9 |
| Hosting | Netlify, Cloudflare Pages or GitHub Pages (free) | Static files only |

## Phases

1. **Scaffold**: folder structure, design tokens, fonts, base layout, mobile-first grid (comfortable at 400 px).
2. **Sections in page order** (spec §7): header and language switcher → hero with the quote form → 3 service cards → 13 activities with a category filter (All, Excursions, Land, Air, Sea) → Why us → How it works → Contact → footer with privacy notice.
3. **Translations**: all text in FR (default), AR, EN, ES. Place and brand names stay the same in every language. Check that longer FR/ES strings don't break the layout.
4. **Form**: fields for service, from, to, date, passengers, name and contact. Validation, labels, WhatsApp message builder, email submission, success message, privacy notice.
5. **Quality**: keyboard navigation, focus states, 4.5:1 contrast, 44 px touch targets, Lighthouse check, testing at phone width in all 4 languages (including RTL).
6. **SEO build**: pre-render script, `hreflang`, sitemap, Open Graph tags.
7. **Handover**: a short editing guide (`GUIDE.md`) covering how to change text, prices, activities, colors and contact details.

## Placeholders until the agency provides content (spec §8)

Agency name and logo, WhatsApp number, email, address, airports (assumed: Marrakech region), prices, photos, licences and insurance, cancellation terms and legal notices. Each placeholder is marked `[À REMPLACER]` in the data files so none of them gets missed.

## Open questions from the spec

- Show prices, or quotes only? **Default: quotes only**, with an optional `price` field per activity that is hidden when empty.
- Extra activities? These can be added to `activities.json` at any time.

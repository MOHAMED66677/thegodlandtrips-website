# TheGodLandTrips website

Airport transfers, private drivers and tours around Marrakech. One-page site in four languages (French, Arabic, English, Spanish), with a WhatsApp quote form, Google Maps destinations and free address suggestions.

- **Edit the content**: see [GUIDE.md](GUIDE.md) (agency details in `content/site.js`, all texts in `content/translations.js`, colors in `css/styles.css`).
- **Preview locally**: open `index.html`, or run `node build.mjs` and serve the `dist` folder.
- **Publish**: push to GitHub. Netlify runs `node build.mjs` and publishes `dist` (see `netlify.toml`).

Other folders:

- `brand/`: logo files (SVG/PNG) and the scripts that generate them and the link-preview images
- `video/`: the promo reel (`reel_final.mp4`) and the scripts to rebuild it

# Captures screenshots of the site for the reel, in each language.
# The site must be served at BASE (e.g. `node build.mjs` + a local server on dist/).
# usage: python capture.py [base_url] [langs...]      e.g. python capture.py http://localhost:8080 fr ar en es de nl
# output: shots/<lang>/{m_hero,d_hero,form,svc_0..2,act_00..12}.png  +  shots/langs/m_<lang>_hero.png
import asyncio, os, sys, shutil
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
LANGS = sys.argv[2:] or ["fr", "ar", "en", "es", "de", "nl"]
HERE = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(HERE, "shots")
PATH = lambda l: "/" if l == "fr" else f"/{l}/"

PREP = """
async () => {
  try { localStorage.setItem('theme', 'light'); } catch (e) {}
  document.documentElement.setAttribute('data-theme', 'light');
  document.documentElement.style.scrollBehavior = 'auto';
  document.querySelectorAll('.reveal').forEach(e => e.classList.add('is-in'));
  document.querySelectorAll('img').forEach(i => { i.loading = 'eager'; });
  const st = document.createElement('style');
  st.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}.mobile-bar{display:none!important}';
  document.head.appendChild(st);
  for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
  window.scrollTo(0, 0);
  await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  await document.fonts.ready;
  window.dispatchEvent(new Event('scroll'));
}
"""

async def page_at(browser, url, w, h, dpr):
    pg = await browser.new_page(viewport={"width": w, "height": h}, device_scale_factor=dpr)
    await pg.goto(url, wait_until="networkidle")
    await pg.evaluate(PREP)
    await pg.wait_for_timeout(400)
    return pg

async def main():
    os.makedirs(os.path.join(SHOTS, "langs"), exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for lang in LANGS:
            out = os.path.join(SHOTS, lang); os.makedirs(out, exist_ok=True)
            url = BASE + PATH(lang)
            # phone: hero + filled quote form
            pg = await page_at(b, url, 390, 844, 2)
            await pg.screenshot(path=f"{out}/m_hero.png")
            shutil.copyfile(f"{out}/m_hero.png", os.path.join(SHOTS, "langs", f"m_{lang}_hero.png"))
            await pg.evaluate("""() => {
              const L = document.documentElement.lang, t = (k) => window.Render.t(L, k);
              document.getElementById('q-from').value = t('dest.airport');
              document.getElementById('q-to').value = t('act.medina.name');
              document.getElementById('q-date').value = '2026-12-12';
              document.getElementById('q-pax').value = '4';
              document.getElementById('q-name').value = 'Sarah Martin';
              document.getElementById('q-contact').value = '+44 7700 900123';
              const v = document.getElementById('q-veh'); if (v) v.value = 'minivan';
            }""")
            await pg.locator("#quote").screenshot(path=f"{out}/form.png")
            await pg.close()
            # desktop: hero + service cards + activity cards
            pg = await page_at(b, url, 1440, 900, 1.5)
            await pg.screenshot(path=f"{out}/d_hero.png")
            cards = pg.locator(".service-card")
            for i in range(await cards.count()):
                await cards.nth(i).screenshot(path=f"{out}/svc_{i}.png")
            acts = pg.locator(".activity-card")
            for i in range(await acts.count()):
                await acts.nth(i).screenshot(path=f"{out}/act_{i:02d}.png")
            await pg.close()
            print("captured", lang, flush=True)
        await b.close()

asyncio.run(main())

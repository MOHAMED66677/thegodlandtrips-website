# Captures screenshots of the site (served at http://localhost:8080) for the reel.
# usage: python capture.py [base_url]
import asyncio, os, sys
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots")
os.makedirs(OUT, exist_ok=True)

PREP = """
async () => {
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
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # Mobile hero in each language
        for lang, path in [("fr", "/"), ("ar", "/ar/"), ("en", "/en/"), ("es", "/es/")]:
            pg = await page_at(b, BASE + path, 390, 844, 2)
            await pg.screenshot(path=f"{OUT}/m_{lang}_hero.png")
            await pg.close()
        # Mobile full page (EN) for the scrolling phone
        pg = await page_at(b, BASE + "/en/", 390, 844, 1.5)
        await pg.screenshot(path=f"{OUT}/m_en_full.png", full_page=True)
        # Filled quote form (EN)
        await pg.fill("#q-from", "Marrakech-Menara Airport")
        await pg.fill("#q-to", "Riad in the Medina")
        await pg.fill("#q-date", "2026-12-12")
        await pg.fill("#q-pax", "4")
        await pg.fill("#q-name", "Sarah Martin")
        await pg.fill("#q-contact", "+44 7700 900123")
        await pg.locator("#quote").screenshot(path=f"{OUT}/m_en_form.png")
        await pg.close()
        # Desktop hero + cards (EN)
        pg = await page_at(b, BASE + "/en/", 1440, 900, 1.5)
        await pg.screenshot(path=f"{OUT}/d_en_hero.png")
        cards = pg.locator(".service-card")
        for i in range(await cards.count()):
            await cards.nth(i).screenshot(path=f"{OUT}/svc_{i}.png")
        acts = pg.locator(".activity-card")
        for i in range(await acts.count()):
            await acts.nth(i).screenshot(path=f"{OUT}/act_{i:02d}.png")
        await pg.close()
        await b.close()

asyncio.run(main())
print("done:", sorted(os.listdir(OUT)))

# Creates the link-preview images (WhatsApp, Facebook, X...) in each language:
#   images/og-fr.jpg, og-ar.jpg, og-en.jpg, og-es.jpg   (1200 x 630)
# usage: python make_og.py
import asyncio, os
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
U = lambda *p: "file:///" + os.path.join(ROOT, *p).replace("\\", "/")

PAGE = """<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700&family=Inter:wght@600;700&family=Space+Grotesk:wght@700&display=block">
<style>
 html,body{margin:0;width:1200px;height:630px;overflow:hidden}
 .wrap{position:relative;width:1200px;height:630px;background:#2E100B;font-family:Inter,sans-serif;color:#fff}
 .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 30%}
 .shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(46,16,11,.94) 0%,rgba(46,16,11,.78) 45%,rgba(46,16,11,.15) 100%)}
 [dir=rtl] .shade{background:linear-gradient(270deg,rgba(46,16,11,.94) 0%,rgba(46,16,11,.78) 45%,rgba(46,16,11,.15) 100%)}
 .c{position:absolute;inset:0;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between;max-width:760px}
 [dir=rtl] .c{inset:0 0 0 auto;font-family:Cairo,sans-serif}
 .logo{width:420px}
 h1{font:700 64px/1.06 "Space Grotesk",sans-serif;letter-spacing:-.02em;margin:0 0 18px}
 [dir=rtl] h1{font:700 60px/1.35 Cairo,sans-serif;letter-spacing:0}
 .eyebrow{font-size:26px;font-weight:600;color:rgba(255,255,255,.85);margin:0}
 .pill{display:inline-flex;align-items:center;gap:14px;align-self:flex-start;background:#F0A63A;color:#2B1915;font-weight:700;font-size:28px;padding:16px 28px;border-radius:999px}
 [dir=rtl] .pill{align-self:flex-start}
 .dot{width:12px;height:12px;border-radius:50%;background:#A13A26}
</style></head><body>
<div class="wrap" id="w"><img class="bg" src="__BG__"><div class="shade"></div>
 <div class="c"><img class="logo" src="__LOGO__">
  <div><h1 id="h"></h1><p class="eyebrow" id="e"></p></div>
  <div class="pill"><span class="dot"></span><span id="p"></span></div></div></div>
<script src="__TR__"></script>
<script>
 window.setLang = function(l){
   const T = I18N[l];
   document.getElementById('w').dir = RTL_LANGS.includes(l) ? 'rtl' : 'ltr';
   document.getElementById('h').textContent = T['hero.title'];
   document.getElementById('e').textContent = T['hero.eyebrow'];
   document.getElementById('p').textContent = T['hero.ctaQuote'] + ' · WhatsApp';
 };
</script></body></html>"""

async def main():
    html = (PAGE.replace("__BG__", U("video", "assets", "koutoubia.jpg"))
                .replace("__LOGO__", U("brand", "logo-horizontal-white.svg"))
                .replace("__TR__", U("content", "translations.js")))
    tmp = os.path.join(HERE, "_og.html")
    open(tmp, "w", encoding="utf-8").write(html)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1200, "height": 630})
        await pg.goto("file:///" + tmp.replace("\\", "/"), wait_until="networkidle")
        for lang in ["fr", "ar", "en", "es", "de", "nl"]:
            await pg.evaluate(f"setLang('{lang}')")
            await pg.evaluate("document.fonts.ready")
            await pg.wait_for_timeout(200)
            await pg.screenshot(path=os.path.join(ROOT, "images", f"og-{lang}.jpg"), type="jpeg", quality=84)
        await b.close()
    os.remove(tmp)
    print("done")

asyncio.run(main())

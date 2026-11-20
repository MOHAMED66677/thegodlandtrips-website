# Exports PNG versions of the logo and a preview sheet (brand/preview.png).
import asyncio, os
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
URL = lambda f: "file:///" + os.path.join(HERE, f).replace("\\", "/")

SHEET = f"""<!doctype html><html><body style="margin:0;width:1400px;font-family:Arial">
<div style="display:grid;grid-template-columns:1fr 1fr;">
  <div style="background:#FBF6F3;height:360px;display:grid;place-items:center"><img src="{URL('logo-horizontal.svg')}" style="width:600px"></div>
  <div style="background:#3D1610;height:360px;display:grid;place-items:center"><img src="{URL('logo-horizontal-white.svg')}" style="width:600px"></div>
  <div style="background:#fff;height:420px;display:grid;place-items:center"><img src="{URL('logo-stacked.svg')}" style="width:420px"></div>
  <div style="background:#F5E6E0;height:420px;display:flex;gap:48px;align-items:center;justify-content:center">
    <img src="{URL('app-icon.svg')}" style="width:220px;border-radius:48px;box-shadow:0 20px 50px rgba(0,0,0,.2)">
    <div style="display:flex;flex-direction:column;gap:22px;align-items:center">
      <img src="{URL('logo-mark.svg')}" style="width:64px"><img src="{URL('logo-mark.svg')}" style="width:32px"><img src="{URL('app-icon.svg')}" style="width:32px"><img src="{URL('app-icon.svg')}" style="width:16px">
    </div>
  </div>
</div></body></html>"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1400, "height": 780})
        open(os.path.join(HERE, "_sheet.html"), "w", encoding="utf-8").write(SHEET)
        await pg.goto(URL("_sheet.html")); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(HERE, "preview.png"), full_page=True)
        # transparent PNG exports
        for name, w in [("logo-horizontal", 1600), ("logo-horizontal-white", 1600), ("logo-stacked", 1000), ("logo-mark", 512), ("app-icon", 512)]:
            await pg.set_content(f'<html><body style="margin:0;background:transparent"><img id="i" src="{URL(name + ".svg")}" style="width:{w}px;display:block"></body></html>')
            await pg.wait_for_timeout(150)
            await pg.locator("#i").screenshot(path=os.path.join(HERE, name + ".png"), omit_background=True)
        await b.close()
    os.remove(os.path.join(HERE, "_sheet.html"))

asyncio.run(main())
print("exported")

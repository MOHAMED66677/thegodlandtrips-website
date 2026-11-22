"""Make the site's photos: light WebP files in several widths in images/photos/
(the site loads them from its own server: faster, no dependency on Unsplash).

Two sources:
  - YOUR photos: put them in mes-photos/ named after the spot they fill
    (see mes-photos/LISEZ-MOI.md), e.g. mes-photos/quad.jpg or mes-photos/hero.jpg.
    The script points content/site.js to them by itself.
  - Otherwise the Unsplash photo whose id is written in content/site.js.

    python tools/photos.py          # only what changed
    python tools/photos.py --force  # redo everything

Needs Pillow: pip install pillow
"""
import io, os, re, sys, urllib.request
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "images", "photos")
OWN = os.path.join(ROOT, "mes-photos")
SITE_JS = os.path.join(ROOT, "content", "site.js")
GUIDES_JS = os.path.join(ROOT, "content", "guides.js")
WIDTHS = [480, 800, 1200, 1600]          # every photo
BIG = {"hero", "contact"}                # full-width photos also get 2000 px
QUALITY = 72
EXTS = (".jpg", ".jpeg", ".png", ".webp")

def read(p):
    return open(p, encoding="utf-8", newline="").read()
def write(p, s):
    open(p, "w", encoding="utf-8", newline="").write(s)

# 1. Your own photos: point their spot in site.js to "photo-own-<spot>"
own = {}
if os.path.isdir(OWN):
    for f in sorted(os.listdir(OWN)):
        stem, ext = os.path.splitext(f)
        if ext.lower() in EXTS:
            own[f"photo-own-{stem.lower()}"] = os.path.join(OWN, f)

site = read(SITE_JS)
for pid, path in own.items():
    spot = pid[len("photo-own-"):]
    # "hero: "photo-..."" (IMAGES) or "{ id: "quad", ... image: "photo-..." }" (activities, vehicles)
    pats = [rf'(\n\s*{re.escape(spot)}:\s*")(photo-[\w-]+)(")',
            rf'(id:\s*"{re.escape(spot)}"[^\n]*?image:\s*")(photo-[\w-]+)(")']
    m = next((m for p in pats for m in [re.search(p, site)] if m), None)
    if not m:
        print(f"? mes-photos/{os.path.basename(path)}: no spot called '{spot}' (see mes-photos/LISEZ-MOI.md)")
        continue
    old = m.group(2)
    if old != pid:
        site = site[:m.start(2)] + pid + site[m.end(2):]
        print(f"site.js: {spot} -> your photo")
        # a guide that used the old photo follows, unless that photo is still used elsewhere
        if f'"{old}"' not in site:
            g = read(GUIDES_JS)
            if f'"{old}"' in g:
                write(GUIDES_JS, g.replace(f'"{old}"', f'"{pid}"'))
                print(f"guides.js: {old} -> {pid}")
write(SITE_JS, site)

# 2. Every photo in use (site.js + guides.js) -> WebP widths (+ JPG for link previews)
ids = {}
for src in (site, read(GUIDES_JS)):
    for key, pid in re.findall(r'(\w+):\s*"(photo-[\w-]+)"', src):
        ids.setdefault(pid, set()).add(key)

os.makedirs(OUT, exist_ok=True)
force = "--force" in sys.argv
total = 0
for pid, keys in sorted(ids.items()):
    widths = WIDTHS + ([2000] if keys & BIG else [])
    targets = [os.path.join(OUT, f"{pid}-{w}.webp") for w in widths] + ([os.path.join(OUT, f"{pid}-1200.jpg")] if "image" in keys else [])
    local = own.get(pid)
    up_to_date = all(os.path.exists(t) for t in targets) and (
        not local or all(os.path.getmtime(t) >= os.path.getmtime(local) for t in targets))
    if not force and up_to_date:
        continue
    if local:
        im = ImageOps.exif_transpose(Image.open(local)).convert("RGB")   # phone photos: apply rotation
    elif pid.startswith("photo-own-"):
        print(f"! {pid}: the file is no longer in mes-photos/"); continue
    else:
        url = f"https://images.unsplash.com/{pid}?fm=jpg&q=90&w={max(widths)}"
        req = urllib.request.Request(url, headers={"User-Agent": "photo-fetch/1.0"})
        im = Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=60).read())).convert("RGB")
    if im.width < 1200:
        print(f"  note: {pid} is only {im.width}px wide, it may look soft on large screens")
    for w in widths:
        r = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        r.save(os.path.join(OUT, f"{pid}-{w}.webp"), "WEBP", quality=QUALITY, method=6)
    # JPG copy for link previews (WhatsApp/Facebook prefer JPG)
    if "image" in keys:
        r = im if im.width <= 1200 else im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
        r.save(os.path.join(OUT, f"{pid}-1200.jpg"), "JPEG", quality=80, optimize=True, progressive=True)
    total += 1
    print("ok", pid, sorted(keys))

# remove files of photos no longer used
for f in os.listdir(OUT):
    pid = next((p for p in ids if f.startswith(p + "-")), None)
    if not pid or (f.endswith(".jpg") and "image" not in ids[pid]):
        os.remove(os.path.join(OUT, f)); print("removed", f)
print(f"{total} photo(s) processed, {len(ids)} in use, {len(own)} of your own")

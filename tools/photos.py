"""Download the Unsplash photos used in content/site.js and store them in
images/photos/ as light WebP files in several widths (the site then loads
them from its own server: faster, and no dependency on Unsplash).

    python tools/photos.py          # only the missing photos
    python tools/photos.py --force  # redo everything

Needs Pillow: pip install pillow
"""
import io, os, re, sys, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "images", "photos")
WIDTHS = [480, 800, 1200, 1600]          # every photo
BIG = {"hero", "contact"}                # full-width photos also get 2000 px
QUALITY = 72

src = open(os.path.join(ROOT, "content", "site.js"), encoding="utf-8").read()
ids = {}
for key, pid in re.findall(r'(\w+):\s*"(photo-[\w-]+)"', src):
    ids.setdefault(pid, set()).add(key)

os.makedirs(OUT, exist_ok=True)
force = "--force" in sys.argv
total = 0
for pid, keys in sorted(ids.items()):
    widths = WIDTHS + ([2000] if keys & BIG else [])
    targets = [os.path.join(OUT, f"{pid}-{w}.webp") for w in widths] + ([os.path.join(OUT, f"{pid}-1200.jpg")] if "image" in keys else [])
    if not force and all(os.path.exists(t) for t in targets):
        continue
    url = f"https://images.unsplash.com/{pid}?fm=jpg&q=90&w={max(widths)}"
    req = urllib.request.Request(url, headers={"User-Agent": "photo-fetch/1.0"})
    im = Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=60).read())).convert("RGB")
    for w in widths:
        r = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        r.save(os.path.join(OUT, f"{pid}-{w}.webp"), "WEBP", quality=QUALITY, method=6)
    # JPG copy for activity link previews (WhatsApp/Facebook prefer JPG)
    if "image" not in keys:
        total += 1; print("ok", pid, sorted(keys)); continue
    im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS).save(
        os.path.join(OUT, f"{pid}-1200.jpg"), "JPEG", quality=80, optimize=True, progressive=True)
    total += 1
    print("ok", pid, sorted(keys))

# remove files of photos no longer used
for f in os.listdir(OUT):
    pid = next((p for p in ids if f.startswith(p + "-")), None)
    if not pid or (f.endswith(".jpg") and "image" not in ids[pid]):
        os.remove(os.path.join(OUT, f)); print("removed", f)
print(f"{total} photo(s) processed, {len(ids)} in use")

# Square site icons made from the emblem (brand/my-logo/emblem.png).
# Google shows the favicon next to the site in search results: it needs a square
# image, at least 48x48 px (a multiple of 48), at a stable address.
# Run:  python brand/my-logo/make_favicons.py   (writes favicon.ico at the root + images/icon-*.png)
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAND = (250, 248, 242, 255)          # site background colour
emblem = Image.open(os.path.join(ROOT, "brand", "my-logo", "emblem.png")).convert("RGBA")

def square(size, pad=0.0, bg=None):
    """Emblem centred in a square; pad = empty margin (fraction of the side)."""
    canvas = Image.new("RGBA", (size, size), bg or (0, 0, 0, 0))
    inner = round(size * (1 - 2 * pad))
    e = emblem.copy()
    e.thumbnail((inner, inner), Image.LANCZOS)
    canvas.alpha_composite(e, ((size - e.width) // 2, (size - e.height) // 2))
    return canvas

out = lambda *p: os.path.join(ROOT, *p)
# favicon.ico (16, 32, 48) at the site root: browsers and Google look there first
icons = [square(s) for s in (48, 32, 16)]
icons[0].save(out("favicon.ico"), sizes=[(48, 48), (32, 32), (16, 16)], append_images=icons[1:])
# PNG sizes for Google (48, 96, 144) and phones
for s in (48, 96, 144):
    square(s).save(out("images", f"icon-{s}.png"), optimize=True)
# Home-screen icons need a solid background (iOS fills transparency with black)
square(180, pad=0.08, bg=SAND).save(out("images", "apple-touch-icon.png"), optimize=True)
square(192, pad=0.08, bg=SAND).save(out("images", "icon-192.png"), optimize=True)
square(512, pad=0.08, bg=SAND).save(out("images", "icon-512.png"), optimize=True)
print("ok")

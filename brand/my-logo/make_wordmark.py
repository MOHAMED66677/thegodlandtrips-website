# Rebuilds the name in the logo's own lettering, in the "left-aligned" style:
#   MARRAKECH
#   ODYSSEY
#   T R A V E L   (smaller, widely spaced, gold)
# Source: the lettering cut from the original logo (wordmark-source.png, navy).
# Writes brand/my-logo/wordmark.png (navy, for light backgrounds),
#        brand/my-logo/wordmark-white.png (white, for dark backgrounds)
#        and the web copies in images/.
import os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(HERE, "wordmark-source.png")

NAVY = (23, 48, 89)
WHITE = (255, 255, 255)
GOLD_ON_LIGHT = (176, 128, 64)     # #B08040, readable on white / cream
GOLD_ON_DARK = (214, 174, 116)     # #D6AE74, like the example on navy

def runs(mask):
    """(start, end) of consecutive True values."""
    out, s = [], None
    for i, v in enumerate(mask):
        if v and s is None: s = i
        if not v and s is not None: out.append((s, i)); s = None
    if s is not None: out.append((s, len(mask)))
    return out

src = Image.open(SRC).convert("RGBA")
A = np.asarray(src)[..., 3]
lines = runs(A.max(axis=1) > 0)
assert len(lines) == 3, lines
crops = []
for y0, y1 in lines:
    im = src.crop((0, y0, src.width, y1))
    crops.append(im.crop(im.getbbox()))
l1, l2, l3 = crops
cap = l1.height

# TRAVEL: cut each letter, shrink a little, re-space widely
a3 = np.asarray(l3)[..., 3]
letters = [l3.crop((x0, 0, x1, l3.height)) for x0, x1 in runs(a3.max(axis=0) > 0)]
assert len(letters) == 6, len(letters)
scale = 1.0
letters = [im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS) for im in letters]
gap = round(cap * 0.42)                      # wide letter spacing
travel_w = sum(im.width for im in letters) + gap * (len(letters) - 1)
travel_h = max(im.height for im in letters)

g1 = round(cap * 0.30)                       # MARRAKECH -> ODYSSEY
g2 = round(cap * 0.55)                       # ODYSSEY -> TRAVEL
W = max(l1.width, l2.width, travel_w)
H = l1.height + g1 + l2.height + g2 + travel_h

def build(main_rgb, travel_rgb):
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    def paste(im, x, y, rgb):
        a = np.asarray(im)[..., 3]
        solid = Image.fromarray(np.dstack([np.full_like(a, rgb[0]), np.full_like(a, rgb[1]), np.full_like(a, rgb[2]), a]), "RGBA")
        out.alpha_composite(solid, (x, y))
    y = 0
    paste(l1, 0, y, main_rgb); y += l1.height + g1
    paste(l2, 0, y, main_rgb); y += l2.height + g2
    x = 0
    for im in letters:
        paste(im, x, y + travel_h - im.height, travel_rgb); x += im.width + gap
    return out

for name, main, gold in [("wordmark", NAVY, GOLD_ON_LIGHT), ("wordmark-white", WHITE, GOLD_ON_DARK)]:
    im = build(main, gold)
    im.save(os.path.join(HERE, name + ".png"), optimize=True)
    h = 140
    web = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    web.quantize(64, method=Image.Quantize.FASTOCTREE).save(os.path.join(ROOT, "images", name + ".png"), optimize=True)
    print(name, im.size, "-> web", web.size)

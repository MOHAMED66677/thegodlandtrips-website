# Cuts the owner's logo (original.webp, cream background) into transparent PNGs:
#   logo-full.png        whole logo (arch + name), for light backgrounds
#   logo-full-white.png  same, name in white, for dark backgrounds
#   emblem.png           the arch alone (header, profile pictures)
# usage: python cutout.py
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
im = Image.open(os.path.join(HERE, "original.webp")).convert("RGB")
a = np.asarray(im).astype(np.float32)
H, W, _ = a.shape
BG = np.array([250, 248, 242], np.float32)
TEXT_TOP = 960                     # the name starts below this line

dist = np.sqrt(((a - BG) ** 2).sum(axis=2))
near = dist < 22

# background = near-cream pixels connected to the image border ...
flood = Image.fromarray((near * 255).astype(np.uint8)).copy()   # writable copy
ImageDraw.floodfill(flood, (0, 0), 128)
bg = np.asarray(flood) == 128
# ... plus every near-cream pixel in the text area (holes of O, D, A, R...)
bg |= near & (np.arange(H)[:, None] >= TEXT_TOP)

# soft edge: pixels next to the background get partial transparency
grow = np.asarray(Image.fromarray((bg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
edge = grow & ~bg
alpha = np.ones((H, W), np.float32)
alpha[bg] = 0
alpha[edge] = np.clip(dist[edge] / 70.0, 0, 1)
# un-mix the cream from the edge colours
rgb = a.copy()
m = edge & (alpha > 0.02)
rgb[m] = np.clip((a[m] - (1 - alpha[m, None]) * BG) / alpha[m, None], 0, 255)

def save(name, rgb_arr, alpha_arr, box=None):
    out = Image.fromarray(np.dstack([rgb_arr, alpha_arr * 255]).astype(np.uint8), "RGBA")
    if box: out = out.crop(box)
    out = out.crop(out.getbbox())
    out.save(os.path.join(HERE, name), optimize=True)
    print("wrote", name, out.size)
    return out

save("logo-full.png", rgb, alpha)
white = rgb.copy()
white[TEXT_TOP:] = [255, 255, 255]
save("logo-full-white.png", white, alpha)
save("emblem.png", rgb, alpha, (0, 0, W, TEXT_TOP - 20))

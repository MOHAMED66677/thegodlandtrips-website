# Builds the TheGodLandTrips logo files (SVG, text converted to vector outlines).
# usage: python make_logo.py <SpaceGrotesk[wght].ttf>
import os, sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

HERE = os.path.dirname(os.path.abspath(__file__))
RED, RED_DARK, AMBER, INK, MUTED, CREAM = "#A13A26", "#7E2A1A", "#F0A63A", "#2B1915", "#6E524B", "#FBF6F3"

VF = sys.argv[1]
FONTS = {w: instantiateVariableFont(TTFont(VF), {"wght": w}) for w in (500, 700)}

def text_path(txt, weight, size, x0, baseline, tracking=-0.01):
    """Return (svg path d, advance width) for txt set in Space Grotesk."""
    f = FONTS[weight]; gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f["head"].unitsPerEm
    sc = size / upm; x = x0; parts = []
    for ch in txt:
        gname = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[gname].draw(TransformPen(pen, (sc, 0, 0, -sc, x, baseline)))
        parts.append(pen.getCommands())
        x += gs[gname].width * sc + tracking * size
    return " ".join(parts), x - x0

# ---------------- the mark (arch + sun + dunes + road + minaret) ----------------
# drawn in a 100 x 112 box
def mark(arch=RED, window=CREAM, sun=AMBER, dune=RED, uid="m"):
    win = "M20 103 V67.5 A36 36 0 1 1 80 67.5 V103 Z"
    return f'''
  <defs><clipPath id="{uid}-win"><path d="{win}"/></clipPath></defs>
  <path d="M11 112 V70.2 A45 45 0 1 1 89 70.2 V112 Z" fill="{arch}"/>
  <path d="{win}" fill="{window}"/>
  <g clip-path="url(#{uid}-win)">
    <circle cx="43" cy="57" r="15.5" fill="{sun}"/>
    <!-- Koutoubia minaret on the horizon -->
    <path d="M62.5 74 V47 h9.5 V74 Z M64 47 V41.5 h6.5 V47 Z M66.3 41.5 V36.5 h2 V41.5 Z" fill="{dune}" opacity=".9"/>
    <path d="M0 73 Q24 62 48 70 T104 66 V120 H0 Z" fill="{dune}" opacity=".45"/>
    <path d="M0 86 Q28 72 56 82 T104 79 V120 H0 Z" fill="{dune}"/>
    <path d="M30 104 C39 96 46 90 48 77.5 L51 77.5 C53 89 58 96 70 104 Z" fill="{window}"/>
  </g>'''

def wordmark(x, baseline, size, c_the, c_god, c_trips, tagline=None, tag_color=MUTED, tag_size=None):
    d1, w1 = text_path("The", 500, size, x, baseline)
    d2, w2 = text_path("GodLand", 700, size, x + w1, baseline)
    d3, w3 = text_path("Trips", 700, size, x + w1 + w2, baseline)
    total = w1 + w2 + w3
    out = f'<path d="{d1}" fill="{c_the}"/><path d="{d2}" fill="{c_god}"/><path d="{d3}" fill="{c_trips}"/>'
    if tagline:
        ts = tag_size or size * 0.27
        dt, wt = text_path(tagline, 500, ts, 0, 0, tracking=0.16)
        # center/left aligned: left-align under wordmark, letter-spaced
        dt, wt = text_path(tagline, 500, ts, x + 2, baseline + size * 0.52, tracking=0.16)
        out += f'<path d="{dt}" fill="{tag_color}"/>'
        total = max(total, wt)
    return out, total

def svg(w, h, body, bg=None):
    rect = f'<rect width="{w:.0f}" height="{h:.0f}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}">{rect}{body}</svg>\n'

def write(name, content):
    open(os.path.join(HERE, name), "w", encoding="utf-8").write(content)
    print("wrote", name)

TAG = "MARRAKECH · TRANSFERS & TOURS"

# 1) Horizontal logo (light backgrounds)
words, ww = wordmark(128, 70, 64, RED, INK, RED, TAG)
write("logo-horizontal.svg", svg(128 + ww + 8, 118, f'<g transform="translate(0,3)">{mark(uid="h")}</g>' + words))

# 2) Horizontal logo, white version (dark / photo backgrounds)
words, ww = wordmark(128, 70, 64, AMBER, "#FFFFFF", AMBER, TAG, tag_color="rgba(255,255,255,.75)")
write("logo-horizontal-white.svg", svg(128 + ww + 8, 118, f'<g transform="translate(0,3)">{mark(arch=AMBER, window=CREAM, dune=RED, uid="hw")}</g>' + words))

# 3) Stacked logo
d1, w1 = text_path("The", 500, 56, 0, 0); d2, w2 = text_path("GodLand", 700, 56, 0, 0); d3, w3 = text_path("Trips", 700, 56, 0, 0)
tw = w1 + w2 + w3; W = max(tw, 300) + 40; x = (W - tw) / 2
ws, _ = wordmark(x, 196, 56, RED, INK, RED)
dt, wt = text_path(TAG, 500, 15, 0, 0, tracking=0.16)
dt, _ = text_path(TAG, 500, 15, (W - wt) / 2, 228, tracking=0.16)
write("logo-stacked.svg", svg(W, 244, f'<g transform="translate({(W - 100) / 2:.1f},10)">{mark(uid="s")}</g>' + ws + f'<path d="{dt}" fill="{MUTED}"/>'))

# 4) Mark only + app icon / favicon
write("logo-mark.svg", svg(100, 112, mark(uid="k")))
write("app-icon.svg", f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><rect width="512" height="512" rx="112" fill="{RED}"/><g transform="translate(106,86) scale(3)">{mark(arch=CREAM, window="#F5E6E0", dune=RED, uid="a")}</g></svg>\n')

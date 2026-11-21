# Simplified vector version of the owner's arch logo, for small sizes
# (favicon, app icon, browser tab). Writes:
#   icon.svg          arch with tile band + compass + dunes (32 px and up)
#   icon-tiny.svg     even simpler, for 16 px favicons
#   app-icon.svg      the icon on a cream rounded square (512 x 512)
import math, os

HERE = os.path.dirname(os.path.abspath(__file__))
NAVY, ORANGE, SAND, TERRA, TEAL, CREAM = "#173059", "#D47338", "#E7B05B", "#C85B29", "#39657B", "#FAF3E6"

OUTER = (8, 116, 8, 58, 8, 30, 28, 12, 50, 4)      # x0,ybottom, then the left Bézier to the apex
def arch(inset):
    """Pointed Moroccan arch, inset from the outer edge (in a 100 x 120 box)."""
    l, r, b = 8 + inset, 92 - inset, 116 - inset
    top = 4 + inset * 1.15
    sh = 58
    return (f"M{l} {b} V{sh} C{l} {30 + inset * .7:.1f} {28 + inset * .55:.1f} {12 + inset * .9:.1f} 50 {top:.1f} "
            f"C{72 - inset * .55:.1f} {12 + inset * .9:.1f} {r} {30 + inset * .7:.1f} {r} {sh} V{b} Z")

def bez(p0, p1, p2, p3, t):
    return tuple((1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d for a, b, c, d in zip(p0, p1, p2, p3))

def star8(cx, cy, R, ratio=.45, rot=22.5):
    pts = []
    for k in range(16):
        ang = math.radians(rot + k * 22.5)
        rr = R if k % 2 == 0 else R * ratio
        pts.append(f"{cx + rr * math.cos(ang):.2f},{cy + rr * math.sin(ang):.2f}")
    return " ".join(pts)

def band_stars():
    # points along the middle of the tile band (inset 3.5 from the outer edge)
    i = 5.6
    l, r = 8 + i, 92 - i
    left = [(l, 58), (l, 30 + i * .7), (28 + i * .55, 12 + i * .9), (50, 4 + i * 1.15)]
    right = [(50, 4 + i * 1.15), (72 - i * .55, 12 + i * .9), (r, 30 + i * .7), (r, 58)]
    pts = [(l, y) for y in (108, 97, 86, 75, 64)] + [bez(*left, t) for t in (.12, .38, .64, .9)]
    pts += [bez(*right, t) for t in (.1, .36, .62, .88)] + [(r, y) for y in (64, 75, 86, 97, 108)]
    out = ""
    for n, (x, y) in enumerate(pts):
        out += f'<polygon points="{star8(x, y, 2.9)}" fill="{TEAL if n % 2 else ORANGE}"/>'
    return out

def icon(detailed=True, uid="i"):
    win = arch(11)
    band = f'<path d="{arch(2.6)}" fill="#F1E4CC"/>{band_stars()}' if detailed else ""
    compass = (f'<polygon points="50,33 53.2,49 50,52 46.8,49" fill="{NAVY}"/>'
               f'<polygon points="50,71 46.8,55 50,52 53.2,55" fill="{NAVY}"/>'
               f'<polygon points="31,52 47,48.8 50,52 47,55.2" fill="{NAVY}"/>'
               f'<polygon points="69,52 53,55.2 50,52 53,48.8" fill="{NAVY}"/>'
               f'<polygon points="{star8(50, 52, 9.5, .3, 0)}" fill="{TERRA}" opacity=".9"/>'
               f'<circle cx="50" cy="52" r="2.6" fill="{ORANGE}" stroke="{NAVY}" stroke-width="1"/>')
    if not detailed:
        compass = (f'<polygon points="50,30 54.5,48 50,52 45.5,48" fill="{NAVY}"/>'
                   f'<polygon points="50,74 45.5,56 50,52 54.5,56" fill="{NAVY}"/>'
                   f'<polygon points="28,52 46,47.5 50,52 46,56.5" fill="{NAVY}"/>'
                   f'<polygon points="72,52 54,56.5 50,52 54,47.5" fill="{NAVY}"/>')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">
  <defs>
    <linearGradient id="{uid}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{ORANGE}"/><stop offset="1" stop-color="{SAND}"/></linearGradient>
    <clipPath id="{uid}c"><path d="{win}"/></clipPath>
  </defs>
  <path d="{arch(0)}" fill="{NAVY}"/>
  {band}
  <path d="{arch(8.6)}" fill="{NAVY}"/>
  <path d="{win}" fill="url(#{uid}g)"/>
  <g clip-path="url(#{uid}c)">
    <path d="M18 92 Q38 80 56 88 T84 84 V110 H18 Z" fill="{TERRA}"/>
    <g fill="{NAVY}"><rect x="66" y="74" width="5.2" height="16"/><rect x="66.9" y="70" width="3.4" height="4.4"/><rect x="68.2" y="66.6" width=".8" height="3.6"/><rect x="62" y="86" width="16" height="4"/></g>
    <path d="M18 99 Q44 90 84 97 V110 H18 Z" fill="{SAND}"/>
  </g>
  {compass}
</svg>
'''

open(os.path.join(HERE, "icon.svg"), "w", encoding="utf-8").write(icon(True))
open(os.path.join(HERE, "icon-tiny.svg"), "w", encoding="utf-8").write(icon(False, "t"))
inner = icon(True, "a").split("\n", 1)[1].rsplit("</svg>", 1)[0]
open(os.path.join(HERE, "app-icon.svg"), "w", encoding="utf-8").write(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="{CREAM}"/>'
    f'<g transform="translate(88 30) scale(3.36)">{inner}</g></svg>\n')
print("wrote icon.svg, icon-tiny.svg, app-icon.svg")

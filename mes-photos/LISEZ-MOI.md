# Your photos / Vos photos

Drop your own photos in this folder, **named after the spot they fill**.
The site uses them in place of the stock (Unsplash) photos.

Example: a photo of your buggies saved as `buggy.jpg` replaces the buggy photo
on the home page, on the buggy page and in the guides that use it.

Formats: `.jpg`, `.jpeg`, `.png`, `.webp`. Best: **landscape**, at least **1600 px wide**,
no text or logo on top, the original file from the phone (not a screenshot).

Then run `python tools/photos.py` and `node build.mjs` (or just ask Claude).
To go back to the stock photo, delete your file and put the old id back in `content/site.js`.

## Big photos on the home page

| File name | Where it shows |
|---|---|
| `hero` | The first big photo at the top of the home page (most important) |
| `transfer` | "Airport transfers" service card |
| `disposal` | "Driver at your disposal" service card |
| `activities` | Activities section banner |
| `why` | "Why choose us" section |
| `contact` | Background of the contact section |

## Activities (card + activity page)

| File name | Activity |
|---|---|
| `medina` | Medina and souks |
| `ouzoud` | Ouzoud waterfalls |
| `essaouira` | Essaouira day trip |
| `ourika` | Ourika valley |
| `agafay` | Agafay desert |
| `zagora` | Zagora desert, 3 days |
| `bahia` | Bahia Palace |
| `majorelle` | Majorelle Garden |
| `saadian` | Saadian Tombs |
| `benyoussef` | Ben Youssef Madrasa |
| `badi` | El Badi Palace |
| `koubba` | Almoravid Koubba |
| `ysl` | Yves Saint Laurent Museum |
| `darbacha` | Dar el Bacha – Museum of Confluences |
| `photomuseum` | Maison de la Photographie |
| `darsisaid` | Dar Si Said – Carpet Museum |
| `cooking` | Moroccan cooking class |
| `quad` | Quad |
| `buggy` | Buggy |
| `motocross` | Motocross |
| `paintball` | Paintball |
| `balloon` | Hot-air balloon |
| `paragliding` | Paragliding |
| `jetski` | Jet ski |
| `aquajet` | Aquajet |

## Vehicles (quote form)

| File name | Vehicle |
|---|---|
| `sedan` | Car |
| `minivan` | Minivan |
| `suv` | 4x4 / SUV |

Only use photos you took yourselves, or ones you have the right to use.
If people can be recognised, ask them first.

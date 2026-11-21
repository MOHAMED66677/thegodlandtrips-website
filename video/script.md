# Marrakech Odyssey Travel promo reel: script (≈30 s, 1080×1920)

| # | Scene | On screen | Voiceover |
|---|---|---|---|
| 1 | Hook | Marrakech Odyssey Travel logo + **Marrakech. Zero transport stress.** Koutoubia photo, phone flies in (3D) | Landing in Marrakech? Skip the stress. |
| 2 | Problem | **No haggling. No waiting.** struck through, spinning clock | No haggling with taxis. No waiting at arrivals. |
| 3 | Turn | **One site. Every ride.** 3D laptop + phone | Meet the new website for your trip. |
| 4 | Services | **Transfers. Private driver. Day trips.** 3 cards flip in | Airport transfers, a private driver, and day trips, all in one place. |
| 5 | Activities | **13 activities** counter + 3D coverflow of the 13 cards | Thirteen activities. Desert, waterfalls, quad bikes and hot-air balloons. |
| 6 | Quote | **Quote in under 1 minute**, form pops out of the phone, WhatsApp message | Get a quote in under a minute, straight on WhatsApp. No account needed. |
| 7 | Languages | **Speaks their language**, 4 phones fan out: FR · عربي · EN · ES | In French, Arabic, English and Spanish. |
| 8 | CTA | Marrakech Odyssey Travel logo, **Your Marrakech, sorted.**, *Request your quote* button, WhatsApp number | Your Marrakech, sorted. Marrakech Odyssey Travel. Request your quote today. |

## Re-render after a change

Edit the lines in `scenes.json` (and the on-screen texts in `reel.html` if needed), then:

1. `python capture.py`: new screenshots of the site (the site must be running on http://localhost:8080)
2. `python audio.py <voice.onnx>`: voiceover (Piper TTS), music, whooshes and timings
3. `python render.py 30`: renders `reel_final.mp4`

Needs: `pip install playwright imageio-ffmpeg piper-tts`, then `playwright install chromium`, and a Piper voice (`python -m piper.download_voices en_US-ryan-high`).

Notes: the voice is synthetic; a real recorded voice (`voice.wav`) will sound more natural. The photos and the WhatsApp number are still placeholders.

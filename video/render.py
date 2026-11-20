# Renders reel.html frame by frame and encodes an MP4.
#
#   python render.py --lang fr            -> output/reel_fr.mp4 (music only, for your own voiceover)
#   python render.py --lang fr --preview 0,5,12   -> preview JPGs in build/preview/
#   python render.py                      -> reel_final.mp4 (original English version with TTS voice)
#
# Language versions need: build/timeline_fixed.json + build/music.wav (python music.py)
# and shots/<lang>/ (python capture.py).
import asyncio, json, os, sys, subprocess, shutil
from playwright.async_api import async_playwright
import imageio_ffmpeg

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "build")
args = sys.argv[1:]
def opt(name, default=None):
    return args[args.index(name) + 1] if name in args else default

lang = opt("--lang")
fps = int(opt("--fps", "30"))
preview = [float(x) for x in opt("--preview").split(",")] if "--preview" in args else None

if lang:
    tl = json.load(open(os.path.join(BUILD, "timeline_fixed.json"), encoding="utf-8"))
    texts = json.load(open(os.path.join(HERE, "reel_texts.json"), encoding="utf-8"))
    js = "window.TIMELINE = %s; window.REEL_LANG = %s; window.REEL_TEXT = %s;" % (json.dumps(tl), json.dumps(lang), json.dumps(texts, ensure_ascii=False))
    audio = os.path.join(BUILD, "music.wav")
    os.makedirs(os.path.join(HERE, "output"), exist_ok=True)
    out = os.path.join(HERE, "output", f"reel_{lang}.mp4")
    frames = os.path.join(BUILD, f"frames_{lang}")
else:
    tl = json.load(open(os.path.join(BUILD, "timeline.json"), encoding="utf-8"))
    js = "window.TIMELINE = " + json.dumps(tl) + ";"
    audio = os.path.join(BUILD, "mix.wav")
    out = os.path.join(HERE, "reel_final.mp4")
    frames = os.path.join(BUILD, "frames")
open(os.path.join(BUILD, "timeline.js"), "w", encoding="utf-8").write(js)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1080, "height": 1920})
        await pg.goto("file:///" + os.path.join(HERE, "reel.html").replace("\\", "/"))
        await pg.evaluate("window.READY")
        if preview:
            d = os.path.join(BUILD, "preview"); os.makedirs(d, exist_ok=True)
            for t in preview:
                await pg.evaluate(f"window.seek({t})")
                await pg.screenshot(path=os.path.join(d, f"{lang or 'en'}_{t:05.2f}.jpg"), type="jpeg", quality=85)
        else:
            shutil.rmtree(frames, ignore_errors=True); os.makedirs(frames)
            n = int(tl["duration"] * fps)
            for i in range(n):
                await pg.evaluate(f"window.seek({i / fps})")
                await pg.screenshot(path=os.path.join(frames, f"{i:05d}.jpg"), type="jpeg", quality=93)
                if i % 300 == 0: print(lang or "en", "frame", i, "/", n, flush=True)
        await b.close()

asyncio.run(main())

if not preview:
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    subprocess.run([ff, "-y", "-loglevel", "error", "-framerate", str(fps), "-i", os.path.join(frames, "%05d.jpg"),
                    "-i", audio, "-vf", "scale=in_range=full:out_range=tv",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-r", str(fps), "-shortest", "-movflags", "+faststart", out], check=True)
    shutil.rmtree(frames, ignore_errors=True)
    print("wrote", out)

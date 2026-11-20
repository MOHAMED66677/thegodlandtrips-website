# Renders reel.html frame by frame and encodes reel_final.mp4
# usage: python render.py [fps] [--preview t1,t2,...]
import asyncio, json, os, sys, subprocess, shutil
from playwright.async_api import async_playwright
import imageio_ffmpeg

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "build")
FRAMES = os.path.join(BUILD, "frames")
tl = json.load(open(os.path.join(BUILD, "timeline.json"), encoding="utf-8"))
open(os.path.join(BUILD, "timeline.js"), "w", encoding="utf-8").write("window.TIMELINE = " + json.dumps(tl) + ";")

fps = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 30
preview = None
if "--preview" in sys.argv:
    preview = [float(x) for x in sys.argv[sys.argv.index("--preview") + 1].split(",")]

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1080, "height": 1920})
        await pg.goto("file:///" + os.path.join(HERE, "reel.html").replace("\\", "/"))
        await pg.evaluate("window.READY")
        if preview:
            os.makedirs(os.path.join(BUILD, "preview"), exist_ok=True)
            for t in preview:
                await pg.evaluate(f"window.seek({t})")
                await pg.screenshot(path=os.path.join(BUILD, "preview", f"t{t:05.2f}.jpg"), type="jpeg", quality=85)
        else:
            shutil.rmtree(FRAMES, ignore_errors=True); os.makedirs(FRAMES)
            n = int(tl["duration"] * fps)
            for i in range(n):
                await pg.evaluate(f"window.seek({i / fps})")
                await pg.screenshot(path=os.path.join(FRAMES, f"{i:05d}.jpg"), type="jpeg", quality=93)
                if i % 150 == 0: print("frame", i, "/", n, flush=True)
        await b.close()

asyncio.run(main())

if not preview:
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    out = os.path.join(HERE, "reel_final.mp4")
    subprocess.run([ff, "-y", "-loglevel", "error", "-framerate", str(fps), "-i", os.path.join(FRAMES, "%05d.jpg"),
                    "-i", os.path.join(BUILD, "mix.wav"),
                    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-r", str(fps), "-shortest", "-movflags", "+faststart", out], check=True)
    print("wrote", out)

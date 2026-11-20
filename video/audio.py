# Builds the voiceover (Piper TTS, one clip per scene), word timings,
# a soft procedural music bed and whoosh effects on scene cuts.
# usage: python audio.py <piper_voice.onnx>
import json, os, sys, wave, urllib.request
import numpy as np
from piper import PiperVoice

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "build"); os.makedirs(OUT, exist_ok=True)
ASSETS = os.path.join(HERE, "assets"); os.makedirs(ASSETS, exist_ok=True)
SR = 22050
LEAD_IN = 0.25      # silence before first word
GAP = 0.35          # breath between scenes
TAIL = 1.4          # music tail after last word

# Background photos (free Unsplash licence) used by the reel
PHOTOS = {
    "koutoubia": "photo-1597212618440-806262de4f6b",
    "lanterns": "photo-1771148886150-fe1784951a68",
}
for name, pid in PHOTOS.items():
    dst = os.path.join(ASSETS, name + ".jpg")
    if not os.path.exists(dst):
        urllib.request.urlretrieve(f"https://images.unsplash.com/{pid}?auto=format&fit=crop&w=1400&h=2400&q=80&fm=jpg", dst)

scenes = json.load(open(os.path.join(HERE, "scenes.json"), encoding="utf-8"))
voice = PiperVoice.load(sys.argv[1])

def synth(text):
    path = os.path.join(OUT, "tmp.wav")
    with wave.open(path, "wb") as wf:
        voice.synthesize_wav(text, wf)
    with wave.open(path, "rb") as wf:
        sr = wf.getframerate()
        data = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    assert sr == SR, sr
    # trim leading/trailing silence
    idx = np.where(np.abs(data) > 0.01)[0]
    return data[max(0, idx[0] - 200): idx[-1] + 400]

voice_track = [np.zeros(int(LEAD_IN * SR), np.float32)]
t = LEAD_IN
tl_scenes, words = [], []
for i, sc in enumerate(scenes):
    clip = synth(sc["vo"])
    dur = len(clip) / SR
    start = t
    # word timings ~ proportional to characters (+ fixed weight)
    ws = sc["vo"].split()
    weights = [len(w) + 2.5 for w in ws]
    total = sum(weights); acc = start
    for w, wt in zip(ws, weights):
        d = dur * wt / total
        words.append({"w": w, "start": round(acc, 3), "end": round(acc + d, 3), "scene": sc["id"]})
        acc += d
    voice_track.append(clip)
    t += dur
    gap = GAP if i < len(scenes) - 1 else TAIL
    voice_track.append(np.zeros(int(gap * SR), np.float32))
    # scene visually spans from its first word (minus lead) to the next scene's first word
    tl_scenes.append({"id": sc["id"], "start": round(start if i else 0, 3)})
    t += gap

duration = round(t, 3)
for i, s in enumerate(tl_scenes):
    s["end"] = tl_scenes[i + 1]["start"] if i + 1 < len(tl_scenes) else duration
voice_all = np.concatenate(voice_track)

# ---------- music bed: warm pad (Am - F - C - G) + soft pulse ----------
n = len(voice_all)
tt = np.arange(n) / SR
music = np.zeros(n, np.float32)
chords = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 261.63, 329.63], [196.0, 246.94, 293.66]]
bar = 2.4
for k in range(int(duration / bar) + 1):
    a, b = int(k * bar * SR), min(n, int((k + 1) * bar * SR + 0.6 * SR))
    if a >= n: break
    seg_t = np.arange(b - a) / SR
    env = np.minimum(1, seg_t / 0.5) * np.exp(-np.maximum(0, seg_t - bar) * 4)
    for f in chords[k % 4]:
        for det in (0.997, 1.003):
            music[a:b] += (np.sin(2 * np.pi * f * det * seg_t) * 0.5 + np.sin(2 * np.pi * f * 2 * det * seg_t) * 0.12) * env * 0.05
# soft kick on each beat (100 bpm)
beat = 0.6
for k in range(int(duration / beat)):
    a = int(k * beat * SR); L = int(0.25 * SR)
    if a + L >= n: break
    st = np.arange(L) / SR
    music[a:a + L] += np.sin(2 * np.pi * (55 + 90 * np.exp(-st * 30)) * st) * np.exp(-st * 14) * 0.22
# fade in/out
fade = np.ones(n); fi = int(0.3 * SR); fo = int(1.2 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
music *= fade

# ---------- whooshes on scene cuts ----------
rng = np.random.default_rng(7)
fx = np.zeros(n, np.float32)
for s in tl_scenes[1:]:
    c = int(s["start"] * SR); L = int(0.5 * SR); a = max(0, c - int(0.3 * SR))
    if a + L >= n: continue
    noise = rng.standard_normal(L).astype(np.float32)
    # simple moving-average low-pass whose width sweeps -> "whoosh"
    out = np.zeros(L, np.float32); csum = np.cumsum(np.insert(noise, 0, 0))
    for j in range(L):
        w = int(40 - 34 * np.sin(np.pi * j / L)); lo = max(0, j - w)
        out[j] = (csum[j + 1] - csum[lo]) / (j + 1 - lo)
    env = np.sin(np.pi * np.arange(L) / L) ** 2
    fx[a:a + L] += out * env * 0.5

mix = voice_all * 1.0 + music * 0.55 + fx * 0.35
mix /= max(1.0, np.max(np.abs(mix)) / 0.95)
with wave.open(os.path.join(OUT, "mix.wav"), "wb") as wf:
    wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes((mix * 32767).astype(np.int16).tobytes())

json.dump({"scenes": tl_scenes, "words": words, "duration": duration}, open(os.path.join(OUT, "timeline.json"), "w"), indent=1)
print("duration", duration)
for s in tl_scenes: print(s)

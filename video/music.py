# Builds the fixed scene timeline (no voiceover) and a soft music bed with
# whooshes on scene cuts, for the language versions of the reel.
# usage: python music.py      -> build/timeline_fixed.json, build/music.wav
import json, os, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "build"); os.makedirs(OUT, exist_ok=True)
SR = 44100

# Scene lengths in seconds: the voiceover for each language should fit these.
SCENES = [("hook", 3.0), ("problem", 3.4), ("turn", 2.6), ("services", 4.6),
          ("acts", 5.0), ("quote", 3.8), ("langs", 3.0), ("cta", 4.4)]

t = 0.0; scenes = []
for sid, d in SCENES:
    scenes.append({"id": sid, "start": round(t, 3), "end": round(t + d, 3)}); t += d
duration = round(t, 3)
json.dump({"scenes": scenes, "words": [], "duration": duration}, open(os.path.join(OUT, "timeline_fixed.json"), "w"), indent=1)

n = int(duration * SR)
music = np.zeros(n, np.float32)
chords = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 261.63, 329.63], [196.0, 246.94, 293.66]]
bar = 2.4
for kb in range(int(duration / bar) + 1):
    a, b = int(kb * bar * SR), min(n, int((kb + 1) * bar * SR + 0.6 * SR))
    if a >= n: break
    st = np.arange(b - a) / SR
    env = np.minimum(1, st / 0.5) * np.exp(-np.maximum(0, st - bar) * 4)
    for f in chords[kb % 4]:
        for det in (0.997, 1.003):
            music[a:b] += (np.sin(2 * np.pi * f * det * st) * 0.5 + np.sin(2 * np.pi * f * 2 * det * st) * 0.12) * env * 0.05
beat = 0.6
for kb in range(int(duration / beat)):
    a = int(kb * beat * SR); L = int(0.25 * SR)
    if a + L >= n: break
    st = np.arange(L) / SR
    music[a:a + L] += np.sin(2 * np.pi * (55 + 90 * np.exp(-st * 30)) * st) * np.exp(-st * 14) * 0.22
fade = np.ones(n); fi = int(0.3 * SR); fo = int(1.5 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
music *= fade

rng = np.random.default_rng(7)
fx = np.zeros(n, np.float32)
for sc in scenes[1:]:
    c = int(sc["start"] * SR); L = int(0.5 * SR); a = max(0, c - int(0.3 * SR))
    if a + L >= n: continue
    noise = rng.standard_normal(L).astype(np.float32)
    csum = np.cumsum(np.insert(noise, 0, 0)); out = np.zeros(L, np.float32)
    for j in range(L):
        w = int(40 - 34 * np.sin(np.pi * j / L)); lo = max(0, j - w)
        out[j] = (csum[j + 1] - csum[lo]) / (j + 1 - lo)
    fx[a:a + L] += out * (np.sin(np.pi * np.arange(L) / L) ** 2) * 0.5

# Music sits low so a voiceover added later stays clear (about -18 dB under full scale)
mix = music * 0.55 + fx * 0.3
mix = mix / max(1e-6, np.max(np.abs(mix))) * 0.35
stereo = np.repeat(mix[:, None], 2, axis=1)
with wave.open(os.path.join(OUT, "music.wav"), "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes((stereo * 32767).astype(np.int16).tobytes())
print("duration", duration)
for sc in scenes: print(sc)

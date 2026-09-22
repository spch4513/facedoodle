# FaceDoodle 😈

> Give anyone horns, fangs & a snot bubble. **Deface responsibly.**

FaceDoodle is an animated face-doodling playground. Drop in a photo, and MediaPipe finds the eyes, mouth,
forehead, ears and chin. Then you (or your worst impulses) pile on **33 hand-drawn, animated doodles**:
devil horns that grow, fangs that drip "ketchup", bees that zigzag around the skull, a brain that pulses through a
cracked forehead, and a pair of pixel sunglasses that *deal with it*.

Every line "boils" like a real hand-drawn cartoon. Every effect makes a noise (a synthesized raspberry, boing, growl or
cackle, and yes, there's a mute button). Every effect comes with a quip.

**Your photo never leaves your browser.** Face detection runs locally in WebAssembly. The backend only stores
the *recipe* for a doodle (which effects, where, what colour) so you can send someone a shareable curse.

---

## Quick start

```bash
npm install
npm run dev
```

- App: <http://localhost:5180> (Vite, proxies `/api/*` to the backend)
- API: <http://localhost:3001> (Express + SQLite)

No face handy? Click **"Deface Gerald instead"**. Gerald is a hand-drawn volunteer. He has consented. Probably.

### Production

```bash
npm run build     # builds client/dist and server/dist
npm start         # Express serves the built app + API on $PORT (default 3001)
```

| Env var | Where | Default | What it does |
|---|---|---|---|
| `PORT` | server | `3001` | HTTP port |
| `PUBLIC_URL` | server | request host | Base URL for OG image tags on `/s/:slug` |
| `SHARE_TTL_DAYS` | server | `7` | Share links self-destruct after this many days 💣 |
| `DB_PATH` | server | `server/data/facedoodle.db` | SQLite file location |
| `VITE_API_URL` | client | `""` (same origin) | Point the frontend at an API on another host |

---

## What's in the box

### The effect catalog

| Demonic | Unhinged | Orbiters | Chaos combos |
|---|---|---|---|
| Devil Horns | Crazy Tongue | Bird Halo | Full Demon |
| Glowing Red Eyes | Crown | Angel Halo | Circus Freak |
| Vampire Fangs | Red Face Paint | Bee Swarm | Bird Demon |
| Demon Goatee | Clown Makeup (it honks) | Stars Orbit | Random Chaos |
| Fire Aura | Unibrow | Flame Ring | |
| Pitchfork | Mustache + Goatee | | |
| Pentagram Forehead | X-Eyes | | |
| Bat Swarm | Speech Bubble | | |
| Smoke from Ears | Lightning Scar | | |
| Demonic Sigil | Third Eye (it blinks, it judges) | | |
| | Rainbow Tears | | |
| | Angry Brows | | |
| | Snot Bubble (it pops) | | |
| | Ear Hair | | |
| | Brain Exposed | | |
| | **Googly Eyes** ✨ bonus | | |
| | **Deal With It** ✨ bonus | | |
| | **Laser Eyes** ✨ bonus | | |

Every effect animates in (draw-in, grow/pop, fly-in, bounce, paint stroke, type-out) and most keep looping
afterwards (flicker, wiggle, orbit, blink, drip).

### The command bar

Type what you want in plain English. No LLM, just a keyword matcher where the longest match wins:

```
devil horns, red eyes, and a crown
full demon and a ring of fire
clown makeup that says "I regret nothing"
bees. just bees.
chaos
```

`↑`/`↓` scroll through your command history. Quoted text, or anything after `says`, goes into a speech bubble.

### The editor

- **Layers panel**: toggle, delete, reorder, resize, recolour, and edit speech bubble text
- **Drag any effect** on the photo, and scroll over it to resize
- **Undo / redo** (50 steps, `⌘Z` / `⇧⌘Z`)
- **Unleash chaos** adds 3 to 5 random effects. **Exorcise all** clears everything (you can undo it, you monster)
- **Intensity** slider, from *Mildly spooky* up to **MAXIMUM HELL**
- **Possession meter**, from "Disappointingly holy" up to "Beyond saving. Congrats."
- A randomly generated title for whoever is being defaced (e.g. *Duke Bogwort, Devourer of Snacks*)
- **Download evidence (PNG)**, plus a **3-second animated clip (WebM)**
- **Summon a share link**: a 6-character `/s/abc123` URL that re-applies the same effects to the recipient's own photo
- Manual anchor mode (tap eyes, mouth, forehead) for when detection can't find a face (cats, potatoes, abstract selfies)
- Mobile layout with a bottom tab bar (Effects / Layers / Export)

---

## API

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/api/share` | `{ effects, intensity, faceData }` | `201 { slug, url }` · rate-limited to 10/min/IP |
| `GET` | `/api/share/:slug` | – | `{ effects, intensity, faceData, hasThumbnail, views, expiresAt }` or `404` |
| `POST` | `/api/share/:slug/thumbnail` | `{ image: base64 PNG }` | `{ success: true }` (PNG magic bytes checked) |
| `GET` | `/api/share/:slug/thumbnail` | – | `image/png` |
| `GET` | `/api/health` | – | `{ ok: true, mood: "mischievous" }` |

In production, `/s/:slug` pages get Open Graph tags, so a link with a thumbnail previews nicely in a group chat.

---

## Architecture

```
facedoodle/
├── client/                 Vite + React 18 + TS + Tailwind
│   └── src/
│       ├── effects/        one self-contained module per effect + registry
│       │   ├── draw.ts     the doodle toolkit: wobbly ink lines, partial paths, hatching, flames, bats
│       │   ├── demonic/ funny/ halo/ chaos/
│       ├── lib/            faceLandmarks, commandParser, canvasRenderer, easing, sfx, export, shareApi, jokes
│       ├── hooks/          useFaceDetection, useAnimationLoop, useEffectStore (undo/redo), useShareLink
│       └── components/     UploadScreen, Editor, PhotoCanvas (+SVG drag handles), CommandBar, panels, dialogs
└── server/                 Express + better-sqlite3 + express-rate-limit
    └── src/                routes/share.ts, db/, utils/slug.ts
```

Each effect implements:

```ts
interface EffectModule {
  id: string; name: string; icon: string; keywords: string[];
  duration: number; category: 'demonic' | 'funny' | 'halo' | 'chaos';
  quip: string; sound?: SoundName; color?: string;
  anchor?(face: FaceData): Point;          // where its drag handle lives
  draw(ctx: EffectContext): void;          // { ctx, face, progress 0→1, time ms, intensity, meta }
  expand?(): { effectId; delay }[];        // chaos combos expand into several layers
}
```

The renderer runs a single `requestAnimationFrame` loop. For each frame it draws the photo, then each visible layer
with its per-layer offset and size applied around the effect's anchor. Effects draw in a head-aligned frame (rotated
with the face), so horns tilt when the head tilts.

## Privacy & good taste

- Photos are decoded, detected, drawn and exported entirely in the browser.
- Share links store only effect configs plus face landmark coordinates. The optional preview thumbnail is **off by
  default** and clearly labelled, because it *does* contain the photo.
- Links expire after 7 days. There are no galleries, feeds or comments. This app is for making your friends laugh,
  not for dunking on strangers.

## Where this differs from the original spec

- **Dev port 5180** instead of 5173 (5173 was already taken on the dev machine). `strictPort` keeps it predictable.
- **GIF export → WebM clip.** `MediaRecorder` records the live canvas with no extra dependency, and the result is
  smoother and smaller than a GIF.
- **Pentagram and Sigil are separate effects.** The spec mapped both keywords to the sigil, which left the Pentagram
  effect with no keyword.
- **Speech bubble text** is edited inline in the Layers panel (or typed in the command bar) instead of via a
  blocking `prompt()`.
- **Share URLs are built client-side** from the app's own origin, so they stay correct behind the dev proxy or when the
  API lives on another host.
- **Thumbnail upload is opt-in**, because the spec's "photos never leave the browser" promise would otherwise be broken.
- **Stretch goals implemented:** drag/resize handles, per-effect colour picker, sound effects with mute, animated
  clip export, 7-day expiring links, view counts, OG tags for share pages, and three bonus effects.
- The MediaPipe WASM runtime is copied into `client/public/` on `predev`/`prebuild` (self-hosted), with a jsDelivr
  fallback. The face model loads from Google's CDN as specified.

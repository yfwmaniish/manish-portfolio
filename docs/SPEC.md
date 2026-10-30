# SPEC — One Evening in Mumbai (v2: 3D visual novel)

> v2 direction, agreed 2026-10-04. The site is a small 3D world you play through as a visual novel: point-and-click in a real 3D Marine Drive, with branching story and choices that visibly change the world. It is not a free-roam game, and it still has to work as a portfolio in 30 seconds.
> `reference/prototype.dc.html` remains the source for copy, data, palette, the cast and the time-of-day curves.

## 1. Core loop
- **Art and camera reference: _Until Then_ (Polychroma Games, 2024)** — a 2.5D side-scroller: pixel characters in a real 3D environment, cinematic camera, mood carried by light, shadow and reflections.
- The night runs 6:05 PM → 5:50 AM across a sequence of **spots** along the promenade (one per scene). The camera is side-on: you walk left → right along the promenade with the sea wall in front, the sea and sky behind, the Queen's Necklace curving away. At interactions it pushes in, tilts and pans; it never free-roams.
- At a spot you **click things in the 3D world** (characters, props). Each interaction is a camera move + a reaction in the world + an Ink dialogue beat with choices.
- **Story progress drives time**, not scroll position. `p` (0–1) is still the single time-of-day value and still feeds the prototype's smoothstep curves (night, dawn, lights, rain), but it advances as you move between spots and finish beats.
- **Scroll walks you sideways** along the promenade between spots (wheel / swipe / arrow keys); Space / click advances dialogue. At a spot, walking pauses until its beat is done or skipped. Every action is also reachable by keyboard and by plain buttons.
- **Fast lane, always visible:** Ali's phone (all content), and a "Just show me the résumé" route. A recruiter must reach every project, the paper, skills and contact without playing.

## 2. World state and choices
- One save state: Ink variables (flags, small counters) mirrored into the Zustand store. Saved to localStorage; "Start the evening over" clears it.
- **Rule: choices change how you see something, never whether you see it.** Every project, the paper, skills and contact are reachable on every path.
- Moments (achievements) are flags too.
- Planned consequences (story copy for these is DRAFT until Ali approves it):
  - Pay off Ali's chai debt → the stall light stays on at dawn; chai wala and Ali's last lines change; your chai glass stays on the wall next to you.
  - Pet the cat → the cat follows the camera to every later spot.
  - 9:40 PM: shelter under the awning or stay in the rain → different framing of the camera roll; the ground stays wet and reflective afterwards.
  - Read the drafts on the lock screen anyway → SCAN notes early; Ali reacts later.
  - First project you ask about → Ali references it for the rest of the night.
  - Leave at midnight → short ending; stay → sunrise.
  - Ending: a recap built from the flags you set, plus moments found.

## 3. The 3D world (R3F)
- Cross-section (world x): sea < -2.0 · sea-wall top -2.0…-1.7 · tiled promenade -1.7…1.4 · kerb · 6-lane road 1.55…8.2 with dashed lanes · footpath · art-deco building row from x≈11. The path curves left (Queen's Necklace).
- Sky: stepped pixel bands crossfading dusk → night → dawn (palettes in prototype), stars + shooting stars, sun sets by p≈0.3 and partly rises at dawn, moon over the sea mid-night, clouds, birds at dusk, far skyline, Bandra–Worli sea link with blinking red tower lights and moving car lights.
- Monsoon rain: pouring by Scene 3 (9:40 PM), stopped by Scene 4 (11:50 PM) — the prototype's curve, shifted to fit scenes as points on the walk. Dims the scene; no rain under shelter.
- Street furniture: lamps every 12 units with warm light pools, tetrapods, couples on the wall, benches, chai cart, lit buildings, traffic both directions, scene signposts.
- **All geometry and characters are built in code** (low-poly primitives), rendered as pixel art: low internal resolution, no antialiasing, flat/toon shading, outlines, palette/dither pass (the Dead Cells technique). Following Until Then, **characters render at a higher pixel density than the environment** (separate render targets composited together) so gestures read clearly. Lighting does the mood: lamp pools, wet-ground reflections, bloom, fog, rain. Hand-made models or sprites can replace any character later without touching the story.
- Characters have procedural animation: idle breathing, head look-at (toward the cursor or the camera), blinking, plus per-character actions (Ali typing / swinging legs / closing the laptop; chai wala pouring; cat tail, walk, sit, follow).
- **Ali's laptop screen is a live render texture** showing real project UI; "show me" means leaning in to look at it.
- Mouse = slight look-around at each spot; hover highlights clickable things (outline + cursor + label).

## 4. Story scenes (spots)
Thresholds in p: Title 0 · S1 0.10 · S2 0.24 · S3 0.38 · S4 0.57 · S5 0.72 · S6 0.88. Copy for each is in the prototype.
- Title: name drops in letter by letter, "Press start".
- S1 6:30 PM "The promenade": Ali on the sea wall with laptop and unfinished chai, chai wala and cart with steam, the cat, a jogger, lamp moth, sea spray. Dialogue trees from prototype `nodes()` become Ink knots.
- S2 8:05 PM "Who's there?": portrait [PIXEL PORTRAIT placeholder] + short bio.
- S3 9:40 PM "Rain on the camera roll": four projects (Veherex, NiceTry, tejaldesae.com, Sentiment Engine) as photos in the world.
- S4 11:50 PM "The notebook": IEEE paper + SCAN explanation + interactive SCAN illustration (labelled as an illustration).
- S5 2:10 AM "Constellations": skills as star constellations in the actual sky + certifications as "shooting stars caught".
- S6 5:48 AM "First light": Ali, bag on, watching the sun rise; his last line is the prototype's closing quote, then the ending card (recap of your choices, moments count, Text Ali / GitHub / Résumé, "Live the evening again"). Its spot sits at p 0.96 so the sun is up (clock ~5:49).
- Each scene also has one easter-egg character: S1 cat/crows/flyers, S2 balloon wala, S3 umbrella seller, S4 cop on a bicycle, S5 sleeping stray, S6 laughter club.

## 5. The phone (HTML overlay, fast lane)
Floating pixel phone with unread badge, spring slide-up, lock screen "Ali: if found, please don't read my drafts" → unlock. Wallpaper = live sky colours. Apps (behaviour and copy as in prototype): Messages (scripted chat, typing indicator, timed replies, quick-reply chips, contact card), Map (pins per spot; tapping travels there), Gallery (project tiles → detail → link), Notes, Time (slider + presets override `p`), Camera (photo mode hides UI, shutter flash), Weather (incl. "Ali's status"), Radio (generated ambience), Moments (8), Contact.

## 6. HUD
Clock (from p), current spot name, spot dots, moments counter, dusk→dawn timeline marker, toasts, Motion toggle, "Just show me the résumé".

## 7. Accessibility and fallbacks
- Everything playable by keyboard; real buttons for every clickable 3D object (an off-screen list mirrors the hotspots at each spot).
- `prefers-reduced-motion` + Motion toggle: camera cuts instead of glides, no head-bob.
- No WebGL / low tier (detect-gpu): the 2.5D prototype approach, or a plain readable page with all content.

## 8. Placeholders to keep until Ali supplies them
[YOUR PIXEL PORTRAIT] · [YOUR EMAIL] · [YOUR LINKEDIN] · [RÉSUMÉ PDF] · [DOI LINK] · Sentiment Engine description/stack/repo.

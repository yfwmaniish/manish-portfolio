# ROADMAP (v2: 3D visual novel)

Status (2026-10-05): steps 1–3, 5 and 6 done (all six scenes playable, each with an easter-egg character; generated soundscape); step 4 partly done (title screen, lazy-loaded world, mobile layout). In progress: "The Scattered Pages" redesign (notebook pages to find, things to do between scenes, chapter cards), all 5 steps done (Veherex demo waits on Ali's input). Fallbacks (7) partly done: plain page for no-WebGL / errors / ?plain (detect-gpu tiers not added). Polish (9): OG image, meta, caching, deployed to https://goatfolio.vercel.app. Live chat (8) not started.

1. **Scaffold:** Vite + React + TS, Tailwind, Zustand, R3F + drei + postprocessing, inkjs, fonts, palette tokens, save/load.
2. **Engine:** Ink story runner synced with the store; visual-novel dialogue box (typewriter, choices); spot + camera system (glide between spots, look-around); input (click, scroll, keys, Space); hover/selection for 3D objects with a mirrored button list; time-of-day from `p`.
3. **Vertical slice — Scene 1 in 3D, fully reactive:** promenade, sea wall, road, lamps, sky with time-of-day; Ali (laptop with live screen, typing, swinging legs), chai wala (pouring), cat (look-at, follow); camera moves per interaction; Ink port of the S1 dialogue trees; 2–3 choices with visible consequences (chai debt, cat follows); the phone with every app; moments + toasts; a stub ending that recaps your flags. Pixelate post-process.
4. **Playtest and tune:** camera easing, timings, hover feedback, mobile layout, performance budget.
5. **Scenes 2–6** in 3D, each with its own interactions and consequences; full ending.
6. **Sound** with Howler: waves, footsteps on glides, chai pour, train horn, rain, crossfades by time.
7. **Fallbacks:** detect-gpu tiers; 2.5D prototype as low tier; plain readable page for no-WebGL / screen readers.
8. **Live "Ali" chat:** Vercel serverless function, resume-grounded persona, rate limiting, scripted chips kept as suggestions.
9. **Polish:** loading screen, reduced motion, analytics (Plausible), OG image, deploy.

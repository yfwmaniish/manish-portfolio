# One Evening in Mumbai: Manish Tiwari (Decimal)

Manish Tiwari's portfolio as a 3D pixel-art visual novel: one night on Marine Drive, sunset to sunrise. Walk the promenade, talk to people, make friends with a black indie, and find Manish's 15 lost notebook pages.

**Live (planned):** https://manish.veltro.co.in · **Plain version:** https://manish.veltro.co.in/?plain

Built on [goatfolio](https://github.com/Ali-bh1/goatfolio) by Ali Bhatkar.

```
npm install
npm run dev      # http://localhost:5173  (add ?hits to see click areas)
npm run build
vercel --prod --yes   # deploy (Vercel CLI, logged in)
```

## Built with
React, TypeScript, Vite · Three.js via React Three Fiber, custom GLSL (two pixel sizes, like *Until Then*) · Ink for the story · Zustand · Tailwind for the overlay UI · Howler.js + Web Audio (every sound and the music is generated in code) · Vercel.

## Where Manish's content lives
- `src/data/person.ts` — name, handle, site.
- `src/data/projects.ts` — projects, side projects, experience, leadership, the about card.
- `src/data/pages.ts` — the 15 notebook pages. `src/data/notebook.ts` — papers, patent, the AdverSim-IDS demo.
- `src/data/scam.ts` — the Sentinel-05 log demo (8:05 PM). `src/data/aegis.ts` — the Aegis Sandbox demo (11:50 PM).
- `src/data/chat.ts` — phone messages and contact details. `src/data/constellations.ts` — skills and certificates.
- `story/promenade.ink` — all dialogue.

Internal ids (`ali`, `cat`, `veherex`, `nicetry`…) are the template's slot names and are kept so every scene still lines up. `projects.ts` has the mapping.

## Where things are
- `src/world/` — the 3D world: scenes, characters (`characters/`), the people between scenes (`stretch1`–`stretch5`), pages, effects (`fx/`).
- `src/ui/` — HUD, dialogue, cards, the Walk on bar, the plain page (`PlainPage.tsx`, also the fallback when 3D can't run).
- `src/audio/` — the generated soundscape, sound effects and music.
- `docs/SPEC.md` — how every system works. `docs/ROADMAP.md` — build order and status.

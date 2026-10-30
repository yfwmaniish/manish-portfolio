import { SCENES } from '../../data/scenes'
import { useStore } from '../../store/useStore'
import { AppBody, AppHeader } from '../shared'
import { usePhone } from '../usePhone'

// Tonight's route: map pins from the prototype's pinDefs, walk positions from the
// scenes. Scenes not built yet show dimmed.
const PIN_XY: Record<string, [number, number]> = {
  promenade: [57, 28],
  'whos-there': [67, 40],
  rain: [52, 52],
  notebook: [72, 62],
  constellations: [50, 72],
  'first-light': [30, 12],
}
const PLACES = [
  { label: 'The gate', time: '6:05 PM', x: 74, y: 8, walkX: -6 as number | null },
  ...SCENES.map((s) => ({ label: s.place, time: s.time, x: PIN_XY[s.id][0], y: PIN_XY[s.id][1], walkX: s.built ? s.x : null })),
]

export function MapApp() {
  const walk = useStore((s) => s.walkTarget)
  const close = usePhone((s) => s.closePhone)
  // the nearest built place is "you are here"
  const here = PLACES.reduce((best, p, i) =>
    p.walkX !== null && Math.abs(p.walkX - walk) < Math.abs((PLACES[best].walkX ?? 1e9) - walk) ? i : best, 0)

  const go = (x: number | null) => {
    if (x === null) return
    useStore.getState().walkTo(x)
    close()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-night">
      <AppHeader title="Tonight's route" />
      <AppBody className="flex flex-col gap-3 p-3">
        <div className="relative aspect-[5/6] w-full overflow-hidden border-2 border-shadow bg-[#1B2550]">
          <svg viewBox="0 0 100 120" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <path d="M100 0 L62 0 L60 18 L55 32 L49 46 L47 60 L49 74 L55 88 L62 102 L68 120 L100 120 Z" fill="#2A2238" />
            <path d="M62 0 L60 18 L55 32 L49 46 L47 60 L49 74 L55 88 L62 102 L68 120" fill="none" stroke="#FFC56B" strokeWidth="1" strokeDasharray="1 2.5" className="motion-safe:animate-[pulse_2s_infinite]" />
            <path d="M20 4 L56 22" stroke="#0A0918" strokeWidth="2" />
            <path d="M20 4 L56 22" stroke="#C9B8D6" strokeWidth=".6" strokeDasharray="2 2" />
            <text x="6" y="70" fontFamily="Silkscreen, monospace" fontSize="4" fill="#7FB2E0">Arabian Sea</text>
            <text x="70" y="62" fontFamily="Silkscreen, monospace" fontSize="4" fill="#C9B8D6">Mumbai</text>
          </svg>
          {PLACES.map((p, i) => (
            <button
              key={p.label}
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              disabled={p.walkX === null}
              onClick={() => go(p.walkX)}
              className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent disabled:cursor-default"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <span
                className={`h-3.5 w-3.5 border-2 border-shadow ${i === here ? 'motion-safe:animate-[pinPulse_1.4s_infinite]' : ''}`}
                style={{ background: i === here ? '#FF8A4C' : p.walkX === null ? '#5A4D6E' : '#F7EAD7' }}
              />
            </button>
          ))}
        </div>
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {PLACES.map((p, i) => (
            <li key={p.label}>
              <button
                type="button"
                disabled={p.walkX === null}
                onClick={() => go(p.walkX)}
                className={`flex min-h-10 w-full cursor-pointer items-center justify-between border-2 border-[#2A1F45] px-2.5 text-left text-cream disabled:cursor-default disabled:opacity-45 ${
                  i === here ? 'bg-[#2A1F45]' : 'bg-transparent'
                }`}
              >
                <span className="font-display text-[16px]">{p.label}</span>
                <span className="font-ui text-[10px] text-lamp-hot">{p.time}</span>
              </button>
            </li>
          ))}
        </ul>
      </AppBody>
    </div>
  )
}

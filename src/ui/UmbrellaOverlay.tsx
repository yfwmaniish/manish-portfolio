import { timeOfDay } from '../lib/time'
import { effectiveP, useStore } from '../store/useStore'

/** Your umbrella, open: its canopy along the top of the screen, dripping. */
export function UmbrellaOverlay() {
  const open = useStore((s) => s.umbrellaOpen)
  // it only drips while it's actually raining
  const wet = useStore((s) => timeOfDay(effectiveP(s)).rain > 0.15)
  if (!open) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[5] motion-safe:animate-[drop_.5s_both]">
      <svg viewBox="0 0 160 22" preserveAspectRatio="none" shapeRendering="crispEdges" className="block h-[18vh] w-full">
        <rect x="0" y="0" width="160" height="12" fill="#1A1424" />
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            <rect x={i * 20} y="12" width="20" height="3" fill="#1A1424" />
            <rect x={i * 20 + 2} y="15" width="16" height="2" fill="#1A1424" />
            <rect x={i * 20 + 6} y="17" width="8" height="1" fill="#1A1424" />
            <rect x={i * 20} y="0" width="1" height="14" fill="#2A2238" />
          </g>
        ))}
        <rect x="0" y="0" width="160" height="1" fill="#3A3048" />
      </svg>
      {wet &&
        [8, 21, 33, 46, 58, 71, 83, 96].map((left, i) => (
        <span
          key={left}
          className="absolute h-2 w-1 bg-[#A9BCE8] motion-safe:animate-[fall_1.4s_linear_infinite]"
          style={{ left: `${left}%`, top: '17vh', animationDelay: `${i * 0.37}s` }}
        />
      ))}
    </div>
  )
}

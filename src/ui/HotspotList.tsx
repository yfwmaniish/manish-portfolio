import { useEffect, useState } from 'react'
import { useInteractables } from '../engine/interactables'
import { useStore } from '../store/useStore'

const NEARBY = 7

/**
 * The 3D world's clickable things as real buttons, for keyboard and screen-reader
 * users. Hidden until focused, then shown as a row at the bottom of the screen.
 */
export function HotspotList() {
  const items = useInteractables((s) => s.items)
  const walk = useStore((s) => s.walkTarget)
  // some things move (flyers, the umbrella seller); re-check who's nearby now and then
  const [, tick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 500)
    return () => window.clearInterval(id)
  }, [])
  const near = Object.values(items).filter((it) => it.shown() && Math.abs(it.x() - walk) < NEARBY)

  return (
    <nav
      aria-label="Things nearby"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-20 flex justify-center opacity-0 focus-within:pointer-events-auto focus-within:opacity-100"
    >
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {near.map((it) => (
          <li key={it.id}>
            <button
              type="button"
              onClick={it.activate}
              className="min-h-11 cursor-pointer border-2 border-shadow bg-cream px-3 font-ui text-[11px] text-night shadow-[3px_3px_0_#0A0918]"
            >
              {it.label}
            </button>
          </li>
        ))}
        {near.length === 0 && <li className="font-ui text-[11px]">Nothing here. Keep walking.</li>}
      </ul>
    </nav>
  )
}

import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'

/** A small pixel label that rides next to the cursor over anything clickable. */
export function HoverTag() {
  const hovered = useStore((s) => s.hovered)
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (el.current) el.current.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 14}px)`
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div ref={el} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-20">
      {hovered && (
        <span className="block whitespace-nowrap border-2 border-shadow bg-cream px-2 py-1 font-ui text-[10px] text-night shadow-[3px_3px_0_#0A0918]">
          ▸ {hovered.label}
        </span>
      )}
    </div>
  )
}

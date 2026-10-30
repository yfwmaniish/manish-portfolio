import { useEffect, useRef } from 'react'
import { FLYERS } from '../data/flyers'
import { useStore } from '../store/useStore'

/** The flyer you just caught, held up close enough to read. */
export function FlyerCard() {
  const id = useStore((s) => s.openFlyer)
  const caught = useStore((s) => s.flyersCaught.length)
  const close = useStore((s) => s.closeFlyer)
  const button = useRef<HTMLButtonElement>(null)
  const flyer = FLYERS.find((f) => f.id === id)

  useEffect(() => {
    if (!flyer) return
    button.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flyer, close])

  if (!flyer) return null
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-shadow/55 p-4"
      onClick={close}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="flyer-head"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-[320px] rotate-[-2deg] flex-col border-[3px] border-shadow shadow-[8px_8px_0_#0A0918] motion-safe:animate-[drop_.45s_both]"
        style={{ background: flyer.paper, color: flyer.ink }}
      >
        <h2
          id="flyer-head"
          className="m-0 px-4 py-3 text-center font-display text-[28px] font-bold leading-none tracking-wide"
          style={{ background: flyer.band, color: flyer.paper }}
        >
          {flyer.head}
        </h2>
        <div className="flex flex-col gap-1 px-5 py-5 text-center font-display text-[19px] leading-snug">
          {flyer.body.map((line) => (
            <p key={line} className="m-0">
              {line}
            </p>
          ))}
        </div>
        <p className="m-0 border-t-2 border-dashed px-4 py-3 text-center font-mono text-[12px] italic opacity-80" style={{ borderColor: flyer.ink }}>
          {flyer.foot}
        </p>
        <div className="flex items-center justify-between gap-3 bg-shadow px-3 py-2">
          <span className="font-ui text-[10px] text-lamp-hot">
            flyers caught · {caught}/{FLYERS.length}
          </span>
          <button
            ref={button}
            type="button"
            onClick={close}
            className="min-h-11 cursor-pointer border-2 border-cream bg-transparent px-3 font-ui text-[11px] text-cream"
          >
            Let it go
          </button>
        </div>
      </div>
    </div>
  )
}

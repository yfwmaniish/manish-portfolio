import { useEffect, useState } from 'react'
import { Anchored } from '../engine/anchors'
import { hitObjects, useInteractables } from '../engine/interactables'
import { useStore } from '../store/useStore'

const NEARBY = 8
// These already have their own marker (Ali, the chai wala, the cat), sparkle
// (pages), or come and go too fast to label (flyers, crows).
const SKIP = /^(ali\d?|vendor|cat|page-|flyer-|crow-)/
// Where a click id and its speech-bubble id differ.
const SPEECH_ID: Record<string, string> = { 'old-couple': 'couple', 'morse-lamp': 'lamp' }

/**
 * A bobbing "!" over every clickable person or thing near you that you haven't
 * tried yet. The "!" is a button too: tap it to do the same as tapping them.
 */
export function InteractHints() {
  const items = useInteractables((s) => s.items)
  const walk = useStore((s) => s.walkTarget)
  const touched = useStore((s) => s.touched)
  const speech = useStore((s) => s.speech)
  const busy = useStore((s) => !!(s.dialogue || s.phoneOpen || s.openPage || s.openFlyer || s.endingOpen))
  // things move and appear; look again now and then
  const [, tick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 600)
    return () => window.clearInterval(id)
  }, [])
  if (busy) return null

  const near = Object.values(items).filter(
    (it) => !SKIP.test(it.id) && !touched.includes(it.id) && hitObjects.has(it.id) && it.shown() && Math.abs(it.x() - walk) < NEARBY,
  )

  return (
    <>
      {near.map((it) => (
        // hide it while that character has a speech bubble up
        <Anchored key={it.id} id={`hint-${it.id}`}>
          {!speech[SPEECH_ID[it.id] ?? it.id] && (
            <button
              type="button"
              onClick={it.activate}
              aria-label={it.label}
              className="pointer-events-auto mb-1 flex h-11 w-11 cursor-pointer items-end justify-center border-0 bg-transparent p-0"
            >
              <span className="block border-[3px] border-shadow bg-lamp px-1.5 font-display text-[17px] font-bold leading-[22px] text-night shadow-[2px_2px_0_#0A0918] motion-safe:animate-[bob_1.1s_ease-in-out_infinite]">
                !
              </span>
            </button>
          )}
        </Anchored>
      ))}
    </>
  )
}

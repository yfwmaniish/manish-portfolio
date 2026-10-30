import { useEffect, useState } from 'react'
import { sound } from '../audio/bus'
import { SCENES, sceneAt } from '../data/scenes'
import { nextStop, prevStop } from '../data/stops'
import { usePhone } from '../phone/usePhone'
import { useStore } from '../store/useStore'

const IDLE_MS = 6000

/**
 * One tap to the next thing worth seeing: the "Walk on" button glides you to the
 * next person or scene, and says what it is. A back button, and a strip showing
 * how far through the night's six chapters you are. Scrolling still works too.
 */
export function WalkNav() {
  const walk = useStore((s) => s.walkTarget)
  const walkTo = useStore((s) => s.walkTo)
  const busy = useStore((s) => !!(s.dialogue || s.phoneOpen || s.openFlyer || s.openPage || s.endingOpen))
  const photo = usePhone((s) => s.photo)
  const [idle, setIdle] = useState(false)

  // nudge: if you've stood still for a while, the button starts to bob
  useEffect(() => {
    setIdle(false)
    const id = window.setTimeout(() => setIdle(true), IDLE_MS)
    return () => window.clearTimeout(id)
  }, [walk, busy])

  if (busy || photo) return null
  const next = nextStop(walk)
  const prev = prevStop(walk)
  const chapter = SCENES.indexOf(sceneAt(walk)) + 1
  const go = (x: number) => {
    sound('tap')
    walkTo(x)
  }

  return (
    <nav aria-label="Walk" className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-4 z-20 flex flex-col gap-1.5 sm:bottom-6 sm:left-6">
      <div className="flex items-center gap-1" aria-label={`Chapter ${chapter} of ${SCENES.length}`}>
        {SCENES.map((s, i) => (
          <span key={s.id} className={`h-2 w-5 border border-shadow ${i < chapter ? 'bg-accent' : 'bg-cream/25'}`} />
        ))}
        <span className="ml-1.5 font-ui text-[9px] tracking-wider text-cream [text-shadow:1px_1px_0_#0A0918]">
          chapter {chapter}/{SCENES.length}
        </span>
      </div>
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={() => prev && go(prev.x)}
          disabled={!prev}
          aria-label={prev ? `Walk back to ${prev.label}` : 'Walk back'}
          className="min-h-12 w-12 cursor-pointer border-[3px] border-shadow bg-cream/90 font-display text-[22px] text-night shadow-[3px_3px_0_#0A0918] disabled:cursor-default disabled:opacity-40"
        >
          ‹
        </button>
        {next ? (
          <button
            type="button"
            onClick={() => go(next.x)}
            className={`flex min-h-12 cursor-pointer flex-col items-start justify-center border-[3px] border-shadow bg-accent px-3.5 text-left text-night shadow-[4px_4px_0_#0A0918] ${idle ? 'motion-safe:animate-[bob_1.2s_ease-in-out_infinite]' : ''}`}
          >
            <span className="font-display text-[19px] font-bold leading-none">Walk on ›</span>
            <span className="mt-0.5 max-w-[150px] truncate font-ui text-[9px] leading-tight sm:max-w-none">next: {next.label}</span>
          </button>
        ) : (
          <span className="flex min-h-12 items-center border-[3px] border-shadow bg-cream/90 px-3 font-ui text-[10px] text-night">the end of the walk</span>
        )}
      </div>
      <span className="self-start bg-shadow/70 px-1.5 py-0.5 font-ui text-[9px] tracking-wider text-cream">
        tap people to talk · or <span className="sm:hidden">swipe</span>
        <span className="hidden sm:inline">scroll</span> to walk
      </span>
    </nav>
  )
}

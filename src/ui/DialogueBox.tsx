import { useEffect, useRef, useState } from 'react'
import { sound } from '../audio/bus'
import { advance, choose, closeTalk } from '../engine/story'
import { useStore } from '../store/useStore'
import { MOODS, type Mood, type Who } from '../portraits/art'
import { Portrait } from './Portrait'
import { useCssHeight } from './useCssHeight'

const CHAR_MS = 26
// Name-tag colours from the prototype.
const WHO_COLOR: Record<string, string> = { Manish: '#B9A3E3', 'Chai wala': '#E7C55A', Indie: '#C98A4A' }

/**
 * Visual-novel dialogue: typewriter line, then choices. Click or Space/Enter to
 * finish the line or move on, number keys to choose, Esc to walk away.
 */
export function DialogueBox() {
  const d = useStore((s) => s.dialogue)
  const reduced = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const motion = useStore((s) => s.motion)
  const [shown, setShown] = useState(0)
  const box = useRef<HTMLElement>(null)
  useCssHeight(box, '--dialogue-h', 'height')
  const open = !!d

  const text = d?.text ?? ''
  const done = shown >= text.length

  // typewriter, restarted for every new line
  useEffect(() => {
    if (!d) return
    if (reduced.current || !motion) {
      setShown(d.text.length)
      sound('tick', { voice: d.who })
      return
    }
    setShown(0)
    const id = window.setInterval(() => setShown((n) => (n >= d.text.length ? n : n + 1)), CHAR_MS)
    return () => window.clearInterval(id)
  }, [d?.line, motion])

  // Focus the box (not a choice) when a conversation opens, so a stray Space can't pick for you.
  useEffect(() => {
    if (open) box.current?.focus({ preventScroll: true })
  }, [open])

  // Text ticks as it types out, every few letters, in the speaker's voice.
  useEffect(() => {
    if (d && shown > 0 && shown < d.text.length && shown % 3 === 1 && d.text[shown - 1] !== ' ') sound('tick', { voice: d.who })
  }, [shown])

  const next = () => {
    if (done) return advance()
    sound('click')
    setShown(text.length)
  }

  useEffect(() => {
    if (!d) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return closeTalk()
      if ((e.key === ' ' || e.key === 'Enter') && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault()
        next()
      }
      const n = Number(e.key)
      if (done && n >= 1 && n <= d.choices.length) choose(d.choices[n - 1].index)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!d) return null
  const color = (d.who && WHO_COLOR[d.who]) || '#FF8A4C'
  const who = d.who && d.who in MOODS ? (d.who as Who) : null
  const mood = who && (MOODS[who] as string[]).includes(d.mood) ? (d.mood as Mood) : 'neutral'

  return (
    <section
      ref={box}
      tabIndex={-1}
      aria-label={d.who ? `Talking with ${d.who}` : 'Conversation'}
      className="fixed inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-[960px] flex-col px-4 pb-4 outline-none sm:px-6 sm:pb-6"
    >
      {/* the speaker's portrait stands behind the top-right of the box, as in a visual novel */}
      {who && (
        <div key={who} className="pointer-events-none absolute bottom-[calc(100%-96px)] right-6 -z-10 motion-safe:animate-[portraitIn_.35s_steps(4)_both] sm:right-10">
          <Portrait who={who} mood={mood} talking={!done} scale={portraitScale()} />
        </div>
      )}
      {d.who && (
        <span
          className="ml-[22px] self-start border-[3px] border-b-0 border-shadow px-[18px] py-1.5 font-display text-[20px] font-bold text-night"
          style={{ background: color }}
        >
          {d.who}
        </span>
      )}
      <div className="flex flex-col gap-4 border-[3px] border-shadow bg-cream px-6 py-5 text-ink shadow-[8px_8px_0_#0A0918]">
        {text && (
          <button
            type="button"
            onClick={next}
            aria-label={done ? 'Next' : 'Show the full line'}
            className="min-h-[76px] cursor-pointer border-0 bg-transparent p-0 text-left font-display text-[clamp(20px,2.3vw,26px)] leading-[1.45] text-inherit"
          >
            <span aria-hidden="true">{text.slice(0, shown)}</span>
            <span className="sr-only">{text}</span>
            <span className="ml-1 inline-block h-1 w-3 bg-ink motion-safe:animate-[caret_.8s_steps(1)_infinite]" />
          </button>
        )}
        <div className="flex flex-wrap items-center gap-2.5">
          {done &&
            d.choices.map((c, i) => (
              <button
                key={`${d.line}-${c.index}`}
                type="button"
                onClick={() => choose(c.index)}
                className="min-h-11 cursor-pointer border-[3px] border-shadow bg-ink px-4 py-2 font-display text-[18px] text-cream shadow-[3px_3px_0_#0A0918] motion-safe:animate-[msgIn_.35s_both]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="mr-1 opacity-60">{i + 1}</span>› {c.text}
              </button>
            ))}
          {done && d.choices.length === 0 && (
            <span className="font-ui text-[10px] text-plum">click or space ›</span>
          )}
          <button
            type="button"
            onClick={closeTalk}
            className="ml-auto min-h-11 cursor-pointer border-0 bg-transparent px-2 font-ui text-[10px] text-plum underline-offset-4 hover:underline"
          >
            Walk on (Esc)
          </button>
        </div>
      </div>
    </section>
  )
}

/** Portrait size: about two-fifths of the screen tall, in whole physical pixels per art pixel. */
function portraitScale() {
  const dpr = window.devicePixelRatio || 1
  const k = Math.max(2, Math.round((Math.min(window.innerHeight * 0.42, 440) * dpr) / 150))
  return k / dpr
}

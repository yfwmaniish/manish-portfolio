import { useEffect, useRef, useState } from 'react'
import { preloadAudio, startAudio } from '../audio'
import { useStore } from '../store/useStore'

const FIRST = 'MANISH'
const LAST = 'TIWARI'

/**
 * The title card, from the prototype: the name drops in letter by letter, then
 * "Press start". It also covers the moment the 3D city is still loading.
 */
export function Title() {
  const started = useStore((s) => s.started)
  const ready = useStore((s) => s.worldReady)
  const [leaving, setLeaving] = useState(false)
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!ready) return
    button.current?.focus({ preventScroll: true })
    // Render the night's sounds while the title is still up.
    void preloadAudio()
  }, [ready])

  if (started) return null

  const start = () => {
    if (!ready || leaving) return
    setLeaving(true)
    startAudio()
    window.setTimeout(() => useStore.setState({ started: true }), 450)
  }

  let i = 0
  const letters = (word: string) =>
    [...word].map((ch) => (
      <span
        key={`${word}${i}`}
        aria-hidden="true"
        className="inline-block motion-safe:animate-[drop_.9s_both]"
        style={{ animationDelay: `${0.1 + i++ * 0.08}s` }}
      >
        {ch}
      </span>
    ))

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-[22px] px-6 text-center transition-opacity duration-500 ${
        leaving ? 'opacity-0' : 'opacity-100'
      } ${ready ? 'bg-[radial-gradient(ellipse_at_center,rgba(7,6,23,.35),rgba(7,6,23,.8))]' : 'bg-[#070617]'}`}
    >
      <span className="font-ui text-[13px] tracking-[3px] text-lamp-hot">a short story by</span>
      <h2
        aria-label="Manish Tiwari"
        className="m-0 font-display text-[clamp(56px,11vw,150px)] font-bold leading-[.95] tracking-[2px] text-cream [text-shadow:4px_4px_0_#6B2B5C,8px_8px_0_#0A0918]"
      >
        {letters(FIRST)}
        <br />
        {letters(LAST)}
      </h2>
      <p className="m-0 max-w-[520px] font-display text-[22px] text-lamp-hot [text-shadow:2px_2px_0_#3A1530]">
        one evening · one city · everything I've broken and built so far
      </p>
      <button
        ref={button}
        type="button"
        onClick={start}
        disabled={!ready}
        className="mt-6 min-h-11 cursor-pointer border-[3px] border-shadow bg-cream px-7 py-4 font-ui text-[16px] tracking-[3px] text-night shadow-[5px_5px_0_#0A0918] disabled:cursor-wait disabled:opacity-70 motion-safe:enabled:animate-[pulse_1.6s_steps(2)_infinite]"
      >
        {ready ? '▸ Press start' : 'lighting the lamps…'}
      </button>
      <span className="mt-10 font-ui text-[11px] tracking-[2px] text-cream/85 motion-safe:animate-[bob_2s_ease-in-out_infinite]">
        walk along the promenade · the night moves with you
      </span>
      <a href="/?plain" className="font-ui text-[10px] tracking-[2px] text-lamp-hot underline-offset-4">
        in a hurry? read the plain version ›
      </a>
    </div>
  )
}

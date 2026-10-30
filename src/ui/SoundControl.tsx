import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'

/**
 * The HUD's sound button: shows the volume, and opens a small panel with a slider
 * a music switch and a mute switch. Esc or a click elsewhere closes it.
 */
export function SoundControl({ box }: { box: string }) {
  const sound = useStore((s) => s.sound)
  const volume = useStore((s) => s.volume)
  const setSound = useStore((s) => s.setSound)
  const setVolume = useStore((s) => s.setVolume)
  const music = useStore((s) => s.music)
  const setMusic = useStore((s) => s.setMusic)
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pct = Math.round(volume * 100)
  const silent = !sound || pct === 0

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="sound-panel"
        className={`min-h-11 cursor-pointer px-2 font-ui text-[10px] text-cream sm:px-3 sm:text-[11px] ${box}`}
      >
        Sound: {silent ? 'off' : `${pct}%`}
      </button>
      {open && (
        <div
          id="sound-panel"
          className="absolute right-0 top-[calc(100%+8px)] flex w-[220px] flex-col gap-3 border-[3px] border-shadow bg-night p-3 shadow-[6px_6px_0_#0A0918]"
        >
          <label htmlFor="volume" className="flex justify-between font-ui text-[11px] text-cream">
            <span>Volume</span>
            <span className="text-lamp-hot">{pct}%</span>
          </label>
          <input
            id="volume"
            type="range"
            min={0}
            max={100}
            step={5}
            value={pct}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="h-11 w-full cursor-pointer accent-accent"
          />
          <button
            type="button"
            onClick={() => setMusic(!music)}
            aria-pressed={music}
            className="min-h-11 cursor-pointer border-2 border-cream/50 bg-night font-ui text-[11px] text-cream"
          >
            Music: {music ? 'on' : 'off'}
          </button>
          <button
            type="button"
            onClick={() => setSound(!sound)}
            aria-pressed={!sound}
            className="min-h-11 cursor-pointer border-[3px] border-shadow bg-cream font-ui text-[11px] text-night shadow-[3px_3px_0_#0A0918]"
          >
            {sound ? 'Mute' : 'Unmute'}
          </button>
        </div>
      )}
    </div>
  )
}

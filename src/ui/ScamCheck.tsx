import { useEffect, useState } from 'react'
import { sound } from '../audio/bus'
import { PROJECTS } from '../data/projects'
import { LOG, LOG_CLUES, LOG_VERDICT } from '../data/scam'
import { useStore } from '../store/useStore'

const STEP_MS = 850
const sentinel = PROJECTS.find((p) => p.id === 'nicetry')!

/**
 * Scene 2: a friend's server log lands on Manish's phone, and you triage it the way
 * Sentinel-05 would. The findings tick in one by one, lighting up their log lines,
 * then the verdict. A labelled illustration. (The 'scam' name is the template's.)
 */
export function ScamCheck() {
  const open = useStore((s) => s.showing === 'scam')
  const [shown, setShown] = useState(-1)

  useEffect(() => {
    if (!open) setShown(-1)
  }, [open])

  useEffect(() => {
    if (shown < 0 || shown > LOG_CLUES.length) return
    const id = window.setTimeout(() => {
      setShown((n) => n + 1)
      sound(shown + 1 > LOG_CLUES.length ? 'chime' : 'tap')
    }, STEP_MS)
    return () => window.clearTimeout(id)
  }, [shown])

  if (!open) return null
  const done = shown > LOG_CLUES.length
  const lit = new Set(LOG_CLUES.slice(0, Math.max(0, Math.min(shown, LOG_CLUES.length))).flatMap((c) => c.lines))

  return (
    <aside
      aria-label="Sentinel-05 demo"
      className="fixed inset-x-0 z-20 mx-auto flex top-[var(--hud-h)] max-h-[calc(100dvh-var(--hud-h)-var(--dialogue-h))] overflow-y-auto overscroll-contain w-[min(860px,calc(100vw-32px))] flex-wrap items-start justify-center gap-5 p-2 motion-safe:animate-[drop_.45s_both]"
    >
      {/* the log on Manish's phone */}
      <div className="flex w-[min(400px,100%)] flex-col gap-2 border-[3px] border-shadow bg-[#0B0A1A] p-3 text-cream shadow-[8px_8px_0_rgba(4,3,12,.85)]">
        <span className="font-ui text-[10px] text-lilac">{LOG.from}</span>
        <ol className="m-0 flex list-none flex-col gap-1 p-0 font-mono text-[11px] leading-snug">
          {LOG.lines.map((l, i) => (
            <li
              key={l}
              className={`break-all border-l-4 px-2 py-1 transition-colors duration-300 ${lit.has(i) ? 'border-[#FF6A6A] bg-[#3A1530] text-[#FFD9D9]' : 'border-transparent bg-[#16142C] text-[#B9B0D0]'}`}
            >
              {l}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex min-w-[260px] flex-1 flex-col gap-3 border-2 border-cream/40 bg-shadow/90 p-5 text-cream shadow-[8px_8px_0_rgba(4,3,12,.85)]" aria-live="polite">
        <span className="font-ui text-[11px] text-accent">Sentinel-05 · a simple demo, not the real pipeline</span>
        {shown < 0 ? (
          <>
            <p className="m-0 text-[14px]">Five lines of a log. Is this server fine, or is someone inside it? Let Sentinel-05 read it.</p>
            <button
              type="button"
              onClick={() => {
                sound('select')
                setShown(0)
              }}
              className="min-h-12 cursor-pointer self-start border-[3px] border-shadow bg-accent px-[18px] py-3 font-ui text-[12px] text-night shadow-[4px_4px_0_#0A0918]"
            >
              Analyse the log ›
            </button>
          </>
        ) : (
          <>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {LOG_CLUES.slice(0, Math.min(shown, LOG_CLUES.length)).map((c) => (
                <li key={c.text} className="flex gap-2 text-[14px] motion-safe:animate-[msgIn_.3s_both]">
                  <span className="font-ui text-[12px] text-[#FF6A6A]">!</span>
                  <span>
                    {c.text} <span className="whitespace-nowrap bg-[#2A1F45] px-1.5 py-0.5 font-ui text-[9px] text-lilac">ATT&CK {c.tag}</span>
                  </span>
                </li>
              ))}
              {!done && <li className="font-ui text-[11px] text-lilac">reading…</li>}
            </ul>
            {done && (
              <div className="flex flex-col gap-2 border-t-2 border-dashed border-cream/30 pt-3 motion-safe:animate-[msgIn_.3s_both]">
                <span className="font-display text-[26px] font-bold text-[#FF8080]">{LOG_VERDICT.title}</span>
                <span className="font-ui text-[10px] text-lilac">
                  Block: <span className="text-cream">{LOG_VERDICT.ioc}</span>
                </span>
                <span className="text-[13px] text-[#E4D6E8]">{LOG_VERDICT.note}</span>
                <a href={sentinel.href} target="_blank" rel="noreferrer" className="self-start border-2 border-shadow bg-cream px-3 py-2.5 font-ui text-[11px] text-ink no-underline">
                  Sentinel-05 on GitHub ›
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  )
}

import { useState } from 'react'
import { sound } from '../audio/bus'
import { ENTRIES, IDS_DEMO } from '../data/notebook'
import { useStore } from '../store/useStore'

/**
 * Scene 4's notebook: Manish's papers and patent on lined paper, and beside it the
 * AdverSim-IDS illustration — attack one flow two ways and watch the IDS verdict.
 */
export function Notebook() {
  const open = useStore((s) => s.showing === 'notebook')
  const [step, setStep] = useState(0)
  if (!open) return null
  const scan = IDS_DEMO.steps[step]

  const more = () => {
    sound('select')
    const next = step >= 2 ? 0 : step + 1
    setStep(next)
    if (next === 2) useStore.getState().unlock('sarcasm')
  }

  return (
    <aside
      aria-label="The notebook"
      className="fixed inset-x-0 z-20 mx-auto grid top-[var(--hud-h)] max-h-[calc(100dvh-var(--hud-h)-var(--dialogue-h))] overflow-y-auto overscroll-contain w-[min(1100px,calc(100vw-32px))] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-6 p-2 motion-safe:animate-[drop_.45s_both]"
    >
      <div
        className="flex flex-col gap-6 border-[3px] border-shadow bg-[#F2E6D4] px-7 py-7 text-ink shadow-[10px_10px_0_rgba(4,3,12,.85)]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 31px, rgba(107,52,95,.18) 31px, rgba(107,52,95,.18) 32px)' }}
      >
        {ENTRIES.map((e) => (
          <div key={e.title} className="flex flex-col gap-1.5">
            <span className="font-ui text-[11px] text-plum">{e.label}</span>
            <span className="font-display text-[24px] font-bold">{e.title}</span>
            <span className="text-[14px]">
              {e.body}{' '}
              {e.link && (
                <a href={e.link.href} target="_blank" rel="noreferrer" className="text-plum">
                  {e.link.label}
                </a>
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 border-2 border-cream/40 bg-shadow/90 p-6 shadow-[8px_8px_0_rgba(4,3,12,.85)]">
        <span className="font-ui text-[11px] text-accent">{IDS_DEMO.tag}</span>
        <div className="self-start border-2 border-shadow bg-cream px-4 py-3 font-display text-[22px] text-ink">{IDS_DEMO.subject}</div>
        {IDS_DEMO.clues.slice(0, step).map((c) => (
          <div key={c} className="self-start border-2 border-dashed border-teal px-3 py-2 text-[14px] text-[#C9E8E2] motion-safe:animate-[msgIn_.35s_both]">
            + {c}
          </div>
        ))}
        <div className="flex flex-col gap-2 pt-1.5">
          <div className="flex justify-between font-ui text-[11px] text-lilac">
            <span>{IDS_DEMO.meter}</span>
            <span>{scan.unc}%</span>
          </div>
          <div className="h-3.5 border-2 border-shadow bg-[#2A1F45]" role="meter" aria-label={IDS_DEMO.meter} aria-valuenow={scan.unc} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full transition-[width] duration-[600ms] ease-[steps(8)]" style={{ width: `${scan.unc}%`, background: scan.bar }} />
          </div>
        </div>
        <div className="flex flex-col gap-0.5" aria-live="polite">
          <span className="font-ui text-[11px] text-lilac">{IDS_DEMO.verdict}</span>
          <span className="font-display text-[26px] text-cream">{scan.read}</span>
          <span className="text-[14px] text-[#E4D6E8]">{scan.note}</span>
        </div>
        <button
          type="button"
          onClick={more}
          className="min-h-12 cursor-pointer self-start border-[3px] border-shadow bg-accent px-[18px] py-3 font-ui text-[12px] text-night shadow-[4px_4px_0_#0A0918]"
        >
          {scan.button}
        </button>
      </div>
    </aside>
  )
}

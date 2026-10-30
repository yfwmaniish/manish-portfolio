import { useRef, useState } from 'react'
import { sound } from '../audio/bus'
import { quickCheck, SAMPLES, type Report, type Sev } from '../data/aegis'
import { useStore } from '../store/useStore'

const SEV: Record<Sev, { label: string; color: string }> = {
  high: { label: 'HIGH', color: '#FF6A6A' },
  med: { label: 'MED', color: '#FFC56B' },
  low: { label: 'LOW', color: '#7FD1C7' },
}

/**
 * Scene 4: Aegis Sandbox as a little demo. Pick one of three made-up samples, or a
 * file of your own: it gets a type, an entropy reading, findings and a verdict.
 * Your own file is read in the browser only, never uploaded and never run.
 * (Shown when the story asks for 'ev', the template's slot name.)
 */
export function AegisCheck() {
  const open = useStore((s) => s.showing === 'ev')
  const [report, setReport] = useState<Report>(SAMPLES[0])
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  if (!open) return null

  const own = async (f: File | undefined) => {
    if (!f) return
    setBusy(true)
    try {
      setReport(await quickCheck(f))
      sound('chime')
    } finally {
      setBusy(false)
    }
  }
  const bad = report.score >= 60

  return (
    <aside
      aria-label="Aegis Sandbox demo"
      className="fixed inset-x-0 z-20 mx-auto flex top-[var(--hud-h)] max-h-[calc(100dvh-var(--hud-h)-var(--dialogue-h))] overflow-y-auto overscroll-contain w-[min(700px,calc(100vw-32px))] flex-col gap-4 border-2 border-cream/40 bg-shadow/90 p-5 text-cream shadow-[8px_8px_0_rgba(4,3,12,.85)] motion-safe:animate-[drop_.45s_both]"
    >
      <span className="font-ui text-[11px] text-teal">Aegis Sandbox · a simple demo, not the real engine</span>
      <h2 className="m-0 font-display text-[26px] font-bold leading-tight">Would you open this file?</h2>

      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((s) => (
          <button
            key={s.name}
            type="button"
            onClick={() => {
              sound('tap')
              setReport(s)
            }}
            aria-pressed={report.name === s.name}
            className={`min-h-11 cursor-pointer border-2 px-3 font-mono text-[11px] ${report.name === s.name ? 'border-shadow bg-teal text-night' : 'border-cream/50 bg-transparent text-cream'}`}
          >
            {s.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="min-h-11 cursor-pointer border-2 border-dashed border-lamp-hot bg-transparent px-3 font-ui text-[10px] text-lamp-hot"
        >
          {busy ? 'checking…' : '+ check a file of yours'}
        </button>
        <input ref={input} type="file" className="hidden" onChange={(e) => own(e.target.files?.[0])} />
      </div>

      <div className="flex flex-col gap-3 border-[3px] border-shadow bg-[#0B0A1A] p-4" aria-live="polite">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="break-all font-mono text-[13px] text-cream">{report.name}</span>
          <span className="font-ui text-[10px] text-lilac">
            {report.type}
            {report.size ? ` · ${report.size}` : ''}
          </span>
        </div>
        {report.sha256 && <span className="break-all font-mono text-[10px] text-[#8E86A8]">sha256 {report.sha256}</span>}

        <div className="flex flex-col gap-1">
          <div className="flex justify-between font-ui text-[10px] text-lilac">
            <span>Entropy (8 = looks like random noise)</span>
            <span>{report.entropy.toFixed(2)}</span>
          </div>
          <div className="h-3.5 border-2 border-shadow bg-[#2A1F45]">
            <div className="h-full transition-[width] duration-500 ease-[steps(8)]" style={{ width: `${(report.entropy / 8) * 100}%`, background: report.entropy > 7.2 ? '#FF8A4C' : '#7FD1C7' }} />
          </div>
        </div>

        {report.findings.length ? (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {report.findings.map((f) => (
              <li key={f.seen} className="grid grid-cols-[44px_1fr] gap-2 text-[13px] motion-safe:animate-[msgIn_.3s_both]">
                <span className="self-start px-1 py-0.5 text-center font-ui text-[9px] text-night" style={{ background: SEV[f.sev].color }}>
                  {SEV[f.sev].label}
                </span>
                <span>
                  <span className="text-cream">Seen: {f.seen}.</span> <span className="text-[#C9BEDC]">Means: {f.means}.</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-[13px] text-[#C9BEDC]">No red flags in these quick checks.</p>
        )}

        <div className="flex items-baseline justify-between border-t-2 border-dashed border-cream/25 pt-3">
          <span className="font-display text-[26px] font-bold" style={{ color: bad ? '#FF8080' : '#7FD1C7' }}>
            {report.verdict}
          </span>
          <span className="font-ui text-[11px] text-lilac">risk {report.score}/100</span>
        </div>
      </div>

      <p className="m-0 text-[12px] text-[#E4D6E8]">
        The three samples are made up. A file of yours is read right here in your browser: it isn't uploaded, and it's never run. The real Aegis does far more, and can also run a sample in a sealed box with no internet to watch what it does.
      </p>
    </aside>
  )
}

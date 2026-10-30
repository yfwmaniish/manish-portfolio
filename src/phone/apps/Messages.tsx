import { CHAT, CONTACT } from '../../data/chat'
import { useStore } from '../../store/useStore'
import { usePhone } from '../usePhone'

export function Messages() {
  const { log, typing, asked, intro, ask, goHome, closePhone } = usePhone()
  const replies = typing || !intro ? [] : Object.keys(CHAT).filter((k) => !asked.includes(k))
  const done = !typing && intro && replies.length === 0

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-night">
      <div className="flex items-center gap-2.5 border-b-2 border-[#2A1F45] px-2.5 py-1">
        <button type="button" onClick={goHome} aria-label="Back to home screen" className="h-11 w-11 cursor-pointer border-0 bg-transparent font-display text-[26px] text-cream">
          ‹
        </button>
        <span className="flex h-[34px] w-[34px] items-center justify-center border-2 border-shadow bg-accent font-display font-bold text-night">A</span>
        <div className="flex flex-col">
          <h2 className="m-0 font-display text-[18px] font-normal leading-[1.1]">Manish</h2>
          <span className="font-ui text-[9px] text-[#9ED9B0]">{typing ? 'typing…' : 'online'}</span>
        </div>
      </div>

      {/* column-reverse keeps the newest message in view */}
      <div className="flex min-h-0 flex-1 flex-col-reverse overflow-auto p-3" aria-live="polite">
        <div className="flex flex-col gap-2">
          {log.map((m, i) =>
            m.card ? (
              <div key={i} className="flex w-[86%] flex-col gap-1.5 self-start border-[3px] border-shadow bg-cream p-3 text-ink shadow-[3px_3px_0_#0A0918] motion-safe:animate-[msgIn_.3s_both]">
                <span className="font-display text-[20px] font-bold">{CONTACT.name}</span>
                <span className="font-ui text-[9px] text-plum">{CONTACT.tagline}</span>
                {[CONTACT.github, CONTACT.email, CONTACT.linkedin].map((l) => (
                  <a key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="py-1.5 text-[13px] text-plum">
                    {l.href.includes('github') ? 'github.com/yfwmaniish' : l.label}
                  </a>
                ))}
              </div>
            ) : (
              <div
                key={i}
                className={`max-w-[82%] border-2 border-shadow px-3 py-[9px] text-[14px] leading-[1.45] text-night motion-safe:animate-[msgIn_.3s_both] ${
                  m.me ? 'self-end bg-accent' : 'self-start bg-cream'
                }`}
              >
                {m.text}
              </div>
            ),
          )}
          {typing && (
            <div className="flex gap-1 self-start border-2 border-shadow bg-cream px-3.5 py-3" aria-label="Manish is typing">
              {[0, 0.15, 0.3].map((d) => (
                <span key={d} className="h-1.5 w-1.5 bg-ink motion-safe:animate-[typingDot_1s_infinite]" style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex min-h-16 flex-wrap content-start gap-1.5 border-t-2 border-[#2A1F45] bg-[#1D1838] p-2.5">
        {replies.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => ask(k)}
            className="min-h-10 cursor-pointer border-2 border-shadow bg-accent px-2.5 py-1.5 text-left font-mono text-[12px] text-night"
          >
            {CHAT[k].q}
          </button>
        ))}
        {done && (
          <button
            type="button"
            onClick={() => {
              // walk on to the sunrise scene, back in real time
              useStore.getState().setTimeOverride(null)
              useStore.getState().walkTo(140)
              closePhone()
            }}
            className="cursor-pointer border-0 bg-transparent px-1 py-2.5 text-left font-ui text-[11px] text-lamp-hot"
          >
            that's everything · go watch the sunrise ›
          </button>
        )}
      </div>
    </div>
  )
}

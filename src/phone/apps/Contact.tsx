import { CONTACT } from '../../data/chat'
import { AppBody, AppHeader } from '../shared'

export function Contact() {
  const rows = [
    { k: 'Email', ...CONTACT.email, accent: false },
    { k: 'GitHub', ...CONTACT.github, accent: false },
    { k: 'LinkedIn', ...CONTACT.linkedin, accent: false },
    { k: 'Résumé', ...CONTACT.resume, accent: true },
  ]
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-night">
      <AppHeader title="Contact" />
      <AppBody className="flex flex-col items-stretch gap-2.5 px-3.5 py-[18px]">
        <div className="flex h-[84px] w-[84px] items-center justify-center self-center border-[3px] border-shadow bg-accent font-display text-[40px] font-bold text-night shadow-[4px_4px_0_#0A0918]">
          A
        </div>
        <span className="self-center font-display text-[24px] font-bold">{CONTACT.name}</span>
        <span className="self-center text-center font-ui text-[9px] text-lilac">{CONTACT.open}</span>
        {rows.map((r) => (
          <a
            key={r.k}
            href={r.href}
            target={r.href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className={`flex min-h-12 items-center justify-between border-2 border-shadow px-3 no-underline ${r.accent ? 'bg-accent text-night' : 'bg-cream text-ink'}`}
          >
            <span className="font-ui text-[10px]">{r.k}</span>
            <span className="text-[12px]">{r.label}</span>
          </a>
        ))}
      </AppBody>
    </div>
  )
}

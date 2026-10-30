import { PROJECTS, SCREENS } from '../data/projects'
import { useStore } from '../store/useStore'

/**
 * What Manish is showing you on his laptop, readable: the prototype's project card,
 * the SCAN notebook entry, or his file.
 */
export function ScreenCard() {
  const showing = useStore((s) => s.showing)
  if (!showing || showing === 'roll' || showing === 'notebook' || showing === 'stars' || showing === 'scam' || showing === 'ev') return null

  const project = PROJECTS.find((p) => p.id === showing)
  const screen = showing === 'scan' || showing === 'about' ? SCREENS[showing] : null

  return (
    <aside
      aria-live="polite"
      className="fixed left-1/2 top-[var(--hud-h)] max-h-[calc(100dvh-var(--hud-h)-var(--dialogue-h))] overflow-y-auto overscroll-contain z-20 w-[min(560px,calc(100vw-32px))] -translate-x-1/2 sm:left-6 sm:translate-x-0 motion-safe:animate-[drop_.45s_both]"
    >
      <span className="ml-[22px] inline-block border-[3px] border-b-0 border-shadow bg-accent px-[18px] py-1.5 font-display text-[20px] font-bold text-night">
        {project?.title ?? screen?.title}
      </span>
      <div className="flex flex-col gap-3 border-[3px] border-shadow bg-cream/[.97] px-6 py-5 text-ink shadow-[8px_8px_0_#0A0918]">
        <span className="font-ui text-[11px] text-plum">{project?.meta ?? screen?.meta}</span>
        <p className="m-0 font-display text-[20px] leading-[1.45]">{project?.desc ?? screen?.desc}</p>
        {(project?.note || (screen && 'note' in screen)) && (
          <p className="m-0 text-[14px] text-[#4A3A5E]">{project?.note ?? (screen && 'note' in screen ? screen.note : '')}</p>
        )}
        {screen && 'facts' in screen && (
          <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-6 gap-y-3">
            {screen.facts.map(([k, v]) => (
              <div key={k}>
                <dt className="font-ui text-[11px] text-plum">{k}</dt>
                <dd className="m-0 mt-1 font-display text-[18px]">{v}</dd>
              </div>
            ))}
          </dl>
        )}
        {screen && 'href' in screen && (
          <a href={screen.href} target="_blank" rel="noreferrer" className="self-start bg-ink px-[18px] py-3.5 font-ui text-[12px] text-cream no-underline">
            View on GitHub ›
          </a>
        )}
        {project && (
          <>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <span key={t} className="bg-ink px-2.5 py-1.5 font-ui text-[11px] text-cream">
                  {t}
                </span>
              ))}
            </div>
            {project.href.startsWith('http') && (
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="self-start bg-ink px-[18px] py-3.5 font-ui text-[12px] text-cream no-underline"
              >
                {project.linkLabel} ›
              </a>
            )}
            {project.href === 'private' && <span className="font-ui text-[11px] text-plum">Built for the police, so the code stays private.</span>}
          </>
        )}
      </div>
    </aside>
  )
}

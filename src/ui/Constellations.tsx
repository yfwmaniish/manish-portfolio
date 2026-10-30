import { CERTIFICATIONS, CONSTELLATION_LABEL, CONSTELLATION_SVG, SKILL_GROUPS } from '../data/constellations'
import { useStore } from '../store/useStore'

/**
 * Scene 5: lying back on the wall, the camera tips up to the sky and Ali's skills are
 * drawn over the stars as constellations (the prototype's chart), with his
 * certifications as shooting stars caught. Narrow screens get the list instead.
 */
export function Constellations() {
  const open = useStore((s) => s.showing === 'stars')
  if (!open) return null

  return (
    <aside aria-label="Constellations" className="pointer-events-auto fixed inset-x-0 top-[var(--hud-h)] max-h-[calc(100dvh-var(--hud-h)-var(--dialogue-h))] overflow-y-auto overscroll-contain z-20 mx-auto flex w-[min(1100px,calc(100vw-32px))] flex-col gap-6">
      <svg
        viewBox="0 0 1000 480"
        role="img"
        aria-label={CONSTELLATION_LABEL}
        className="hidden w-full overflow-visible sm:block [&_.constellation-line]:[stroke-dasharray:900] [&_.constellation-line]:motion-safe:animate-[draw_2.4s_ease-out_both]"
        dangerouslySetInnerHTML={{ __html: CONSTELLATION_SVG }}
      />
      <div className="grid grid-cols-2 gap-4 border-2 border-cream/35 bg-shadow/80 p-5 sm:hidden">
        {SKILL_GROUPS.map((g) => (
          <div key={g.name}>
            <div className="font-ui text-[11px] text-accent">{g.name}</div>
            <div className="font-display text-[17px]">{g.items.join(' · ')}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3.5 motion-safe:animate-[msgIn_.5s_both_1.6s]">
        <span className="font-ui text-[11px] tracking-wider text-lamp-hot">Shooting stars caught:</span>
        {CERTIFICATIONS.map((c) => (
          <span key={c} className="border-2 border-cream/40 bg-shadow/80 px-3.5 py-2 font-display text-[17px]">
            ★ {c}
          </span>
        ))}
      </div>
    </aside>
  )
}

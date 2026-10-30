import { useEffect, useRef, useState, type ReactNode } from 'react'
import { sound } from '../audio/bus'
import { POLAROID_ART } from '../data/polaroids'
import { PROJECTS, type Project } from '../data/projects'
import { portraitFrame } from '../portraits/raster'
import { useStore } from '../store/useStore'

// Tilts from the prototype's Scene 3 polaroids.
const TILT: Record<string, number> = { evening: 1.5, veherex: -3, nicetry: 2, tejal: -1.5, sentiment: 3, you: -2 }

/**
 * Scene 3's camera roll: the prototype's four project polaroids (plus the photo you
 * took of Ali at 8:05, if you did). Tap one to lift it and read about it.
 */
export function CameraRoll() {
  const open = useStore((s) => s.showing === 'roll')
  const tookPhoto = useStore((s) => !!s.flags.took_portrait)
  const [sel, setSel] = useState<Project['id'] | 'you'>('veherex')
  if (!open) return null

  const project = PROJECTS.find((p) => p.id === sel)

  return (
    <aside
      aria-label="Camera roll"
      className="fixed inset-x-0 z-20 mx-auto flex top-[var(--hud-h)] max-h-[calc(100dvh-var(--hud-h)-var(--dialogue-h))] overflow-y-auto overscroll-contain w-[min(1100px,calc(100vw-32px))] flex-col gap-4 px-2 pb-2 motion-safe:animate-[drop_.45s_both]"
    >
      <div className="grid grid-cols-2 gap-x-5 gap-y-6 p-2 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
        {PROJECTS.map((p) => (
          <Polaroid key={p.id} id={p.id} title={p.title} sub={p.sub} selected={sel === p.id} onPick={() => setSel(p.id)}>
            <svg viewBox="0 0 64 48" shapeRendering="crispEdges" className="block w-full border-2 border-shadow" aria-hidden="true" dangerouslySetInnerHTML={{ __html: POLAROID_ART[p.id] }} />
          </Polaroid>
        ))}
        {tookPhoto && (
          <Polaroid id="you" title="Manish, 8:05 PM" sub="don't post it" selected={sel === 'you'} onPick={() => setSel('you')}>
            <PortraitPhoto />
          </Polaroid>
        )}
      </div>

      <div aria-live="polite" className="flex flex-col">
        <span className="ml-[22px] self-start border-[3px] border-b-0 border-shadow bg-accent px-[18px] py-1.5 font-display text-[20px] font-bold text-night">
          {project?.title ?? 'Manish, 8:05 PM'}
        </span>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-x-10 gap-y-4 border-[3px] border-shadow bg-cream px-6 py-5 text-ink shadow-[8px_8px_0_#0A0918]">
          {project ? (
            <>
              <div className="flex flex-col gap-3">
                <span className="font-ui text-[11px] text-plum">{project.meta}</span>
                {project.story && <p className="m-0 border-l-4 border-accent pl-3 font-display text-[18px] text-plum">Manish: “{project.story}”</p>}
                <p className="m-0 font-display text-[20px] leading-[1.45]">{project.desc}</p>
                <p className="m-0 text-[14px] text-[#4A3A5E]">{project.note}</p>
              </div>
              <div className="flex flex-col justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((t) => (
                    <span key={t} className="bg-ink px-2.5 py-1.5 font-ui text-[11px] text-cream">
                      {t}
                    </span>
                  ))}
                </div>
                {project.href.startsWith('http') && (
                  <a href={project.href} target="_blank" rel="noreferrer" className="self-start bg-ink px-[18px] py-3.5 font-ui text-[12px] text-cream no-underline">
                    {project.linkLabel} ›
                  </a>
                )}
                {project.href === 'private' && <span className="font-ui text-[11px] text-plum">Built for the police, so the code stays private.</span>}
              </div>
            </>
          ) : (
            // DRAFT
            <p className="m-0 font-display text-[20px] leading-[1.45]">The photo you took under the streetlight. He's already checking it for metadata.</p>
          )}
        </div>
      </div>
    </aside>
  )
}

function Polaroid({
  id,
  title,
  sub,
  selected,
  onPick,
  children,
}: {
  id: string
  title: string
  sub: string
  selected: boolean
  onPick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={() => {
        sound('photo')
        onPick()
      }}
      aria-pressed={selected}
      className="flex cursor-pointer flex-col gap-2.5 bg-[#F2E6D4] px-3 pb-4 pt-3 text-left font-[inherit] text-ink shadow-[6px_8px_0_rgba(4,3,12,.85)] transition-transform duration-300 ease-[cubic-bezier(.2,1.3,.4,1)] hover:shadow-[10px_14px_0_rgba(10,9,24,.85)]"
      style={{
        border: `3px solid ${selected ? '#FF8A4C' : '#0A0918'}`,
        transform: `rotate(${TILT[id]}deg) translateY(${selected ? -14 : 0}px)`,
      }}
    >
      {children}
      <span className="font-display text-[20px] font-bold leading-tight">{title}</span>
      <span className="font-ui text-[10px] text-plum">{sub}</span>
    </button>
  )
}

/** Your photo of Ali: his portrait, smug, cropped like a snapshot. */
function PortraitPhoto() {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    portraitFrame('Manish', { mood: 'smug', blink: false, talk: false }).then((src) => {
      const g = canvas.current?.getContext('2d')
      if (!g) return
      g.fillStyle = '#2A1F45'
      g.fillRect(0, 0, 64, 48)
      g.fillStyle = '#FFC56B'
      g.fillRect(44, 0, 20, 48) // streetlight glow behind him
      g.imageSmoothingEnabled = false
      // head and shoulders of the 120×150 portrait, scaled into 64×48
      g.drawImage(src, 20, 10, 80, 60, 0, 0, 64, 48)
    })
  }, [])
  return (
    <canvas
      ref={canvas}
      width={64}
      height={48}
      aria-hidden="true"
      className="block w-full border-2 border-shadow [image-rendering:pixelated]"
    />
  )
}

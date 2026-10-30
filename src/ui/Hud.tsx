import { PAGES } from '../data/pages'
import { useRef } from 'react'
import { sceneAt } from '../data/scenes'
import { clockLabel } from '../lib/time'
import { usePhone } from '../phone/usePhone'
import { effectiveP, useStore } from '../store/useStore'
import { SoundControl } from './SoundControl'
import { useCssHeight } from './useCssHeight'

/**
 * Clock and place, notebook pages found, motion toggle, sound control, and the fast lane straight to
 * Ali's contact card for anyone short on time.
 */
export function Hud() {
  const p = useStore(effectiveP)
  const travelling = useStore((s) => s.tOverride !== null)
  const place = useStore((s) => sceneAt(s.walkTarget).title)
  const motion = useStore((s) => s.motion)
  const setMotion = useStore((s) => s.setMotion)
  const pages = useStore((s) => s.pagesFound.length)
  const openPhone = usePhone((s) => s.openPhone)

  const top = useRef<HTMLDivElement>(null)
  useCssHeight(top, '--hud-h', 'bottom', '84px')

  const box = 'border-2 border-cream/50 bg-shadow/80 shadow-[4px_4px_0_rgba(4,3,12,.8)]'

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-4 sm:p-6">
      <div ref={top} className="flex flex-wrap items-start justify-between gap-3">
        <div className={`flex items-center gap-3 px-3.5 py-2 ${box}`}>
          <span className="min-w-[6.5rem] font-ui text-[18px] text-cream">{clockLabel(p)}</span>
          <span className="h-[22px] w-0.5 bg-cream/35" />
          <span className="font-ui text-[11px] tracking-wider text-accent">{travelling ? 'Time travelling' : place}</span>
        </div>
        <nav aria-label="Shortcuts" className="pointer-events-auto flex flex-wrap justify-end gap-1.5 sm:gap-2">
          <button type="button" onClick={() => openPhone('contact')} className={`min-h-11 cursor-pointer px-2 font-ui text-[10px] text-cream sm:px-3 sm:text-[11px] ${box}`}>
            <span className="sm:hidden">Résumé</span>
            <span className="hidden sm:inline">Just show me the résumé</span>
          </button>
          <button
            type="button"
            onClick={() => openPhone('pages')}
            aria-label={`Notebook pages found: ${pages} of ${PAGES.length}`}
            className={`min-h-11 cursor-pointer px-2 font-ui text-[11px] text-lamp-hot sm:px-3 sm:text-[12px] ${box}`}
          >
            Pages {pages}/{PAGES.length}
          </button>
          <button
            type="button"
            onClick={() => setMotion(!motion)}
            aria-pressed={!motion}
            className={`min-h-11 cursor-pointer px-2 font-ui text-[10px] text-cream sm:px-3 sm:text-[11px] ${box}`}
          >
            Motion: {motion ? 'on' : 'off'}
          </button>
          <SoundControl box={box} />
        </nav>
      </div>
    </div>
  )
}

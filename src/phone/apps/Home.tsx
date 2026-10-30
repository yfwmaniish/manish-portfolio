import type { ReactNode } from 'react'
import { wallpaper, weather } from '../../lib/sky'
import { useStore } from '../../store/useStore'
import { useTod } from '../shared'
import { usePhone, type AppId } from '../usePhone'

// App icons, pixel for pixel from the prototype (12×12 grid).
const r = (x: number, y: number, w: number, h: number, fill: string) => <rect key={`${x}${y}${w}${h}${fill}`} x={x} y={y} width={w} height={h} fill={fill} />

const ICONS: { id: AppId; label: string; bg: string; art: ReactNode }[] = [
  { id: 'messages', label: 'Messages', bg: '#3E8E85', art: [r(1, 2, 10, 6, '#F7EAD7'), r(2, 8, 2, 2, '#F7EAD7'), r(3, 4, 1, 1, '#3E8E85'), r(5, 4, 1, 1, '#3E8E85'), r(7, 4, 1, 1, '#3E8E85')] },
  { id: 'map', label: 'Map', bg: '#4A6FA5', art: [r(1, 2, 10, 8, '#C9E0B8'), r(1, 2, 4, 8, '#7FB2E0'), r(7, 2, 2, 2, '#E04848'), r(6, 3, 4, 2, '#E04848'), r(7, 5, 2, 2, '#E04848')] },
  { id: 'pages', label: 'Notebook', bg: '#FBF3E4', art: [r(2, 1, 8, 10, '#14122B'), r(3, 2, 6, 8, '#FBF3E4'), r(4, 4, 4, 1, '#6B345F'), r(4, 6, 4, 1, '#6B345F'), r(1, 2, 2, 1, '#14122B'), r(1, 5, 2, 1, '#14122B'), r(1, 8, 2, 1, '#14122B')] },
  { id: 'gallery', label: 'Gallery', bg: '#B85A70', art: [r(1, 1, 10, 10, '#F7EAD7'), r(2, 2, 8, 6, '#4E2A5E'), r(6, 3, 2, 2, '#FFC56B'), r(2, 6, 8, 2, '#1B2550')] },
  { id: 'notes', label: 'Notes', bg: '#E7C55A', art: [r(2, 1, 8, 10, '#F7EAD7'), r(3, 3, 6, 1, '#6B345F'), r(3, 5, 6, 1, '#6B345F'), r(3, 7, 4, 1, '#6B345F')] },
  { id: 'clock', label: 'Time', bg: '#2A1F45', art: [r(3, 1, 6, 10, '#F7EAD7'), r(1, 3, 10, 6, '#F7EAD7'), r(2, 2, 8, 8, '#F7EAD7'), r(6, 3, 1, 3, '#2A1F45'), r(6, 6, 2, 1, '#FF8A4C')] },
  { id: 'camera', label: 'Camera', bg: '#5A4A6E', art: [r(1, 3, 10, 7, '#F7EAD7'), r(4, 2, 4, 1, '#F7EAD7'), r(4, 5, 4, 4, '#1E1630'), r(5, 6, 2, 2, '#7FD1C7')] },
  { id: 'weather', label: 'Weather', bg: '#3B4C7E', art: [r(3, 3, 6, 3, '#F7EAD7'), r(2, 4, 8, 3, '#F7EAD7'), r(3, 8, 1, 2, '#7FB2E0'), r(6, 8, 1, 2, '#7FB2E0'), r(9, 8, 1, 2, '#7FB2E0')] },
  { id: 'radio', label: 'Radio', bg: '#FF8A4C', art: [r(5, 2, 1, 7, '#14122B'), r(6, 2, 4, 1, '#14122B'), r(9, 2, 1, 6, '#14122B'), r(3, 8, 3, 2, '#14122B'), r(7, 7, 3, 2, '#14122B')] },
  { id: 'moments', label: 'Moments', bg: '#6B345F', art: [r(5, 1, 2, 10, '#FFE3A8'), r(1, 4, 10, 2, '#FFE3A8'), r(3, 3, 6, 5, '#FFE3A8'), r(2, 8, 2, 2, '#FFE3A8'), r(8, 8, 2, 2, '#FFE3A8')] },
  { id: 'contact', label: 'Contact', bg: '#7FD1C7', art: [r(4, 1, 4, 4, '#14122B'), r(2, 6, 8, 5, '#14122B')] },
]

export function Home() {
  const tod = useTod()
  const moments = useStore((s) => Object.keys(s.moments).length)
  const unread = usePhone((s) => s.unread)
  const openApp = usePhone((s) => s.openApp)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-auto px-3.5 py-4" style={{ background: wallpaper(tod) }}>
      <div className="flex items-end justify-between border-2 border-cream/40 bg-shadow/60 px-3.5 py-3">
        <div className="flex flex-col">
          <span className="font-display text-[34px] font-bold leading-[1.1]">{tod.clock}</span>
          <span className="font-ui text-[10px] text-lamp-hot">{weather(tod).cond}</span>
        </div>
        <div className="text-right font-ui text-[10px] text-lamp-hot">
          Moments
          <br />
          <span className="font-display text-[22px] text-cream">{moments}/8</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-x-1.5 gap-y-3.5">
        {ICONS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => openApp(a.id)}
            className="group relative flex cursor-pointer flex-col items-center gap-1.5 border-0 bg-transparent px-0 py-1 font-[inherit] text-cream"
          >
            <span
              className="flex h-[54px] w-[54px] items-center justify-center border-[3px] border-shadow shadow-[3px_3px_0_#0A0918] transition-transform duration-200 group-hover:-translate-y-1 group-focus-visible:-translate-y-1"
              style={{ background: a.bg }}
            >
              <svg width="30" height="30" viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true">
                {a.art}
              </svg>
            </span>
            <span className="font-ui text-[9px] [text-shadow:1px_1px_0_#0A0918]">{a.label}</span>
            {a.id === 'messages' && unread > 0 && (
              <span className="absolute right-1.5 top-0 flex h-5 min-w-5 items-center justify-center border-2 border-shadow bg-[#E04848] font-display text-[13px]">
                {unread}
              </span>
            )}
          </button>
        ))}
      </div>
      <span className="mt-auto self-center font-ui text-[9px] text-lamp-hot [text-shadow:1px_1px_0_#0A0918]">
        wallpaper follows the sky outside
      </span>
    </div>
  )
}

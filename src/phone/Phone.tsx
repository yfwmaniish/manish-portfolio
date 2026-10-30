import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { CameraApp } from './apps/CameraApp'
import { Contact } from './apps/Contact'
import { Gallery } from './apps/Gallery'
import { Home } from './apps/Home'
import { Lock } from './apps/Lock'
import { MapApp } from './apps/MapApp'
import { Messages } from './apps/Messages'
import { Moments } from './apps/Moments'
import { Notes } from './apps/Notes'
import { Pages } from './apps/Pages'
import { Radio } from './apps/Radio'
import { TimeMachine } from './apps/TimeMachine'
import { Weather } from './apps/Weather'
import { useTod } from './shared'
import { usePhone, type AppId } from './usePhone'

const APPS: Record<AppId, () => React.JSX.Element> = {
  lock: Lock,
  home: Home,
  messages: Messages,
  map: MapApp,
  gallery: Gallery,
  notes: Notes,
  pages: Pages,
  clock: TimeMachine,
  camera: CameraApp,
  weather: Weather,
  radio: Radio,
  moments: Moments,
  contact: Contact,
}

/** The phone: springs up from the corner, status bar, the current app, home bar. */
export function Phone() {
  const open = useStore((s) => s.phoneOpen)
  const app = usePhone((s) => s.app)
  const { closePhone, goHome } = usePhone.getState()
  const { clock } = useTod()
  const closeButton = useRef<HTMLButtonElement>(null)
  const Screen = APPS[app]

  useEffect(() => {
    if (!open) return
    closeButton.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closePhone()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closePhone])

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Manish's phone"
      aria-hidden={!open}
      className="fixed bottom-[18px] right-[22px] z-30 box-border flex h-[min(720px,calc(100vh-100px))] w-[min(352px,calc(100vw-32px))] flex-col rounded-[36px] bg-shadow p-2.5 shadow-[0_0_0_3px_#3A2E52,14px_18px_0_rgba(4,3,12,.55)] transition-[transform,visibility] duration-[600ms] ease-[cubic-bezier(.2,1.2,.3,1)]"
      style={{
        transform: open ? 'translateY(0) rotate(0deg)' : 'translateY(118%) rotate(7deg)',
        visibility: open ? 'visible' : 'hidden',
      }}
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[26px] bg-night text-cream">
        <div className="flex items-center justify-between bg-shadow/70 py-0.5 pl-[18px] pr-1.5">
          <span className="min-w-[70px] font-ui text-[11px]">{clock}</span>
          <span className="-mt-1.5 h-5 w-[74px] rounded-b-xl bg-shadow" />
          <button
            ref={closeButton}
            type="button"
            onClick={closePhone}
            aria-label="Put the phone away"
            className="flex h-11 w-11 cursor-pointer items-center justify-center border-0 bg-transparent text-cream"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M3 3 L13 13 M13 3 L3 13" />
            </svg>
          </button>
        </div>
        {open && <Screen />}
        <div className="flex justify-center bg-shadow pb-0.5 pt-1">
          <button
            type="button"
            onClick={goHome}
            aria-label="Home screen"
            className="flex h-[26px] w-[140px] cursor-pointer items-center justify-center border-0 bg-transparent"
          >
            <span className="h-[5px] w-[110px] rounded-[3px] bg-cream" />
          </button>
        </div>
      </div>
    </div>
  )
}

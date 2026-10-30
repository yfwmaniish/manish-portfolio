import { useMemo, type ReactNode } from 'react'
import { clockLabel, timeOfDay } from '../lib/time'
import { effectiveP, useStore } from '../store/useStore'
import { usePhone } from './usePhone'

/** Time of night for the phone's screens; re-renders only when the time changes. */
export function useTod() {
  const p = useStore(effectiveP)
  return useMemo(() => ({ ...timeOfDay(p), clock: clockLabel(p) }), [p])
}

/** App title bar with a back button, as in the prototype. */
export function AppHeader({
  title,
  onBack,
  light = false,
  backLabel = 'Back to home screen',
}: {
  title: string
  onBack?: () => void
  light?: boolean
  backLabel?: string
}) {
  const goHome = usePhone((s) => s.goHome)
  return (
    <div className={`flex items-center gap-2 border-b-2 px-2.5 py-1 ${light ? 'border-lilac' : 'border-[#2A1F45]'}`}>
      <button
        type="button"
        onClick={onBack ?? goHome}
        aria-label={backLabel}
        className={`h-11 w-11 cursor-pointer border-0 bg-transparent font-display text-[26px] ${light ? 'text-ink' : 'text-cream'}`}
      >
        ‹
      </button>
      <h2 className="m-0 font-display text-[20px] font-normal">{title}</h2>
    </div>
  )
}

/** Scrolling body of an app screen. */
export function AppBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`min-h-0 flex-1 overflow-auto ${className}`}>{children}</div>
}

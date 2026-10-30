import { usePhone } from '../phone/usePhone'
import { useStore } from '../store/useStore'

/**
 * Once the umbrella seller has given you one, it lives in the corner beside the
 * phone: tap to open it over your head, tap again to fold it away.
 */
export function UmbrellaButton() {
  const owned = useStore((s) => s.umbrellaOwned)
  const open = useStore((s) => s.umbrellaOpen)
  const setUmbrella = useStore((s) => s.setUmbrella)
  const hidden = useStore((s) => !!s.dialogue || s.phoneOpen)
  const photo = usePhone((s) => s.photo)
  if (!owned) return null

  return (
    <button
      type="button"
      onClick={() => setUmbrella(!open)}
      aria-pressed={open}
      aria-label={open ? 'Close the umbrella' : 'Open the umbrella'}
      className={`fixed bottom-6 right-[104px] z-20 flex h-[88px] w-[64px] cursor-pointer flex-col items-center justify-end gap-1 border-0 bg-transparent p-0 transition-opacity duration-300 ${
        hidden || photo ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <svg viewBox="0 0 16 20" width="52" height="65" shapeRendering="crispEdges" aria-hidden="true" className="block drop-shadow-[4px_4px_0_#0A0918]">
        {open ? (
          <>
            <rect x="1" y="5" width="14" height="2" fill="#0A0918" />
            <rect x="3" y="3" width="10" height="2" fill="#0A0918" />
            <rect x="6" y="2" width="4" height="1" fill="#0A0918" />
            <rect x="2" y="5" width="12" height="1" fill="#C0504A" />
            <rect x="4" y="4" width="8" height="1" fill="#DD6A5C" />
            <rect x="0" y="7" width="16" height="1" fill="#0A0918" />
            <rect x="1" y="6" width="3" height="1" fill="#C0504A" />
            <rect x="6" y="6" width="4" height="1" fill="#DD6A5C" />
            <rect x="12" y="6" width="3" height="1" fill="#C0504A" />
            <rect x="7" y="8" width="2" height="9" fill="#0A0918" />
            <rect x="7" y="17" width="5" height="2" fill="#0A0918" />
            <rect x="10" y="15" width="2" height="2" fill="#0A0918" />
          </>
        ) : (
          <>
            <rect x="6" y="2" width="4" height="12" fill="#0A0918" />
            <rect x="7" y="3" width="2" height="10" fill="#C0504A" />
            <rect x="7" y="14" width="2" height="3" fill="#0A0918" />
            <rect x="7" y="17" width="5" height="2" fill="#0A0918" />
            <rect x="10" y="15" width="2" height="2" fill="#0A0918" />
            <rect x="5" y="7" width="1" height="2" fill="#0A0918" />
          </>
        )}
      </svg>
      <span className="font-ui text-[9px] text-cream [text-shadow:1px_1px_0_#0A0918]">{open ? 'close' : 'open'}</span>
    </button>
  )
}

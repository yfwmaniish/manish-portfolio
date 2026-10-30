import { useStore } from '../store/useStore'
import { usePhone } from './usePhone'

/** Manish's phone, face up in the corner, buzzing while there are unread messages. */
export function PhoneButton() {
  const open = useStore((s) => s.phoneOpen)
  const hidden = useStore((s) => !!s.dialogue)
  const unread = usePhone((s) => s.unread)
  const photo = usePhone((s) => s.photo)
  const openPhone = usePhone((s) => s.openPhone)

  return (
    <button
      type="button"
      onClick={() => openPhone(unread > 0 ? 'messages' : undefined)}
      aria-label={unread > 0 ? `Open Manish's phone, ${unread} unread` : "Open Manish's phone"}
      className={`fixed bottom-6 right-6 z-20 h-[88px] w-[78px] cursor-pointer border-0 bg-transparent p-0 transition-opacity duration-300 ${
        open || hidden || photo ? 'pointer-events-none opacity-0' : 'opacity-100'
      } ${unread > 0 ? 'motion-safe:animate-[buzz_2.6s_infinite_1.5s]' : ''}`}
    >
      <svg viewBox="0 0 20 24" width="66" height="80" shapeRendering="crispEdges" aria-hidden="true" className="mx-auto block drop-shadow-[4px_4px_0_#0A0918]">
        <rect x="2" y="0" width="16" height="24" fill="#0A0918" />
        <rect x="1" y="1" width="18" height="22" fill="#0A0918" />
        <rect x="3" y="2" width="14" height="18" fill="#2B1F47" />
        <rect x="3" y="11" width="14" height="3" fill="#944063" />
        <rect x="3" y="14" width="14" height="2" fill="#DD6A5C" />
        <rect x="3" y="16" width="14" height="4" fill="#1B2550" />
        <rect x="11" y="12" width="4" height="4" fill="#FFC56B" />
        <rect x="5" y="4" width="7" height="3" fill="#F7EAD7" />
        <rect x="8" y="21" width="4" height="1" fill="#5A4D6E" />
      </svg>
      {unread > 0 && (
        <span className="absolute -top-1 right-0 flex h-[26px] min-w-[26px] items-center justify-center border-[3px] border-shadow bg-[#E04848] font-display text-[16px] font-bold text-cream">
          {unread}
        </span>
      )}
    </button>
  )
}

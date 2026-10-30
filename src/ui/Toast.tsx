import { useStore } from '../store/useStore'

/** "★ Moment unlocked · …", dropped in from the top, as in the prototype. */
export function Toast() {
  const toast = useStore((s) => s.toast)
  return (
    <div role="status" className="pointer-events-none fixed left-1/2 top-[88px] z-[35] -translate-x-1/2">
      {toast && (
        <div
          key={toast}
          className="whitespace-nowrap border-[3px] border-shadow bg-lamp-hot px-[18px] py-2.5 font-display text-[18px] text-night shadow-[5px_5px_0_#0A0918] motion-safe:animate-[drop_.6s_both]"
        >
          ★ Moment unlocked · {toast}
        </div>
      )}
    </div>
  )
}

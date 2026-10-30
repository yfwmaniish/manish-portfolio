import { wallpaper, weather } from '../../lib/sky'
import { useTod } from '../shared'
import { usePhone } from '../usePhone'

export function Lock() {
  const tod = useTod()
  const unlock = usePhone((s) => s.unlockPhone)
  return (
    <div className="flex flex-1 flex-col items-center gap-1 px-4 pb-4 pt-[26px]" style={{ background: wallpaper(tod) }}>
      <span className="font-ui text-[11px] tracking-wider [text-shadow:1px_1px_0_#0A0918]">Sunday · Mumbai</span>
      <span className="font-display text-[54px] font-bold leading-[1.1] [text-shadow:3px_3px_0_#0A0918]">{tod.clock}</span>
      <span className="font-ui text-[10px] [text-shadow:1px_1px_0_#0A0918]">{weather(tod).cond}</span>
      <button
        type="button"
        onClick={unlock}
        className="mt-auto flex w-full cursor-pointer flex-col gap-1 border-[3px] border-shadow bg-cream/95 px-3.5 py-3 text-left font-[inherit] text-ink shadow-[4px_4px_0_#0A0918] motion-safe:animate-[drop_.7s_both_.3s]"
      >
        <span className="font-ui text-[10px] text-plum">Messages · now</span>
        <span className="font-display text-[18px] leading-[1.3]">Manish: if found, please don't read my drafts. Yes, it's encrypted.</span>
        <span className="text-[12px] text-[#4A3A5E]">Tap to unlock</span>
      </button>
      <span className="mt-2.5 font-ui text-[10px] [text-shadow:1px_1px_0_#0A0918] motion-safe:animate-[bob_1.6s_ease-in-out_infinite]">
        tap the notification
      </span>
    </div>
  )
}

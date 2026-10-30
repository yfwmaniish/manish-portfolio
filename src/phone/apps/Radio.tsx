import { useStore } from '../../store/useStore'
import { AppBody, AppHeader } from '../shared'

export function Radio() {
  const on = useStore((s) => s.radioOn)
  const setRadio = useStore((s) => s.setRadio)
  const toggle = () => setRadio(!on)
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#1D1838]">
      <AppHeader title="Radio" />
      <AppBody className="flex flex-col items-center gap-4 px-4 py-[22px] text-center">
        <div
          className={`flex h-[170px] w-[170px] items-center justify-center rounded-full border-4 border-[#2A1F45] bg-shadow ${on ? 'motion-safe:animate-[spin_4s_linear_infinite]' : ''}`}
        >
          <span className="h-[58px] w-[58px] rounded-full border-4 border-shadow bg-accent" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-display text-[22px] font-bold">Marine Drive FM</span>
          <span className="font-ui text-[10px] text-lilac">sea waves and a soft hum, made live in your browser</span>
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-pressed={on}
          className="min-h-[52px] min-w-[160px] cursor-pointer border-[3px] border-shadow bg-accent font-ui text-[13px] text-night shadow-[3px_3px_0_#0A0918]"
        >
          {on ? '❚❚ Pause' : '▶ Play'}
        </button>
        <span className="text-[12px] text-[#E4D6E8]">Best with headphones.</span>
      </AppBody>
    </div>
  )
}

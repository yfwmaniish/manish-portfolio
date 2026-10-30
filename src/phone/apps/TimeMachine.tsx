import { useStore } from '../../store/useStore'
import { AppBody, AppHeader, useTod } from '../shared'

// Presets from the prototype.
const PRESETS = [
  { label: 'Sunset', t: 0.06, cls: 'bg-[#FFB067] text-night border-shadow' },
  { label: 'Monsoon', t: 0.5, cls: 'bg-[#A9BCE8] text-night border-shadow' },
  { label: 'Midnight', t: 0.68, cls: 'bg-[#0F0D29] text-cream border-cream' },
  { label: 'Sunrise', t: 0.97, cls: 'bg-[#FFDCA8] text-night border-shadow' },
]

export function TimeMachine() {
  const { clock, p } = useTod()
  const travelling = useStore((s) => s.tOverride !== null)
  const setT = useStore((s) => s.setTimeOverride)

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-night">
      <AppHeader title="Time machine" />
      <AppBody className="flex flex-col gap-4 px-3.5 py-[18px]">
        <span className="text-center font-display text-[52px] font-bold leading-none">{clock}</span>
        <span className="text-center text-[13px] text-[#E4D6E8]">Drag the slider to change the time of night. Watch the city behind the phone change too.</span>
        <label htmlFor="time-slider" className="font-ui text-[10px] text-lilac">
          Hour
        </label>
        <input
          id="time-slider"
          type="range"
          min={0}
          max={100}
          value={Math.round(p * 100)}
          onChange={(e) => setT(Number(e.target.value) / 100)}
          className="h-8 w-full accent-accent"
        />
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((pr) => (
            <button key={pr.label} type="button" onClick={() => setT(pr.t)} className={`min-h-11 cursor-pointer border-2 font-ui text-[10px] ${pr.cls}`}>
              {pr.label}
            </button>
          ))}
        </div>
        {travelling && (
          <button type="button" onClick={() => setT(null)} className="min-h-11 cursor-pointer border-2 border-shadow bg-accent font-ui text-[11px] text-night">
            Back to real time
          </button>
        )}
      </AppBody>
    </div>
  )
}

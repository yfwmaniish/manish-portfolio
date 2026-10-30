import { wallpaper, weather } from '../../lib/sky'
import { AppBody, AppHeader, useTod } from '../shared'

export function Weather() {
  const tod = useTod()
  const w = weather(tod)
  return (
    <div className="flex min-h-0 flex-1 flex-col" style={{ background: wallpaper(tod) }}>
      <div className="bg-shadow/60">
        <AppHeader title="Weather" />
      </div>
      <AppBody className="flex flex-col gap-2.5 px-4 py-[22px]">
        <span className="font-ui text-[11px] [text-shadow:1px_1px_0_#0A0918]">Marine Drive, Mumbai</span>
        <span className="font-display text-[34px] font-bold leading-[1.1] [text-shadow:3px_3px_0_#0A0918]">{w.cond}</span>
        <dl className="m-0 mt-3 flex flex-col gap-2 border-2 border-cream/40 bg-shadow/70 p-3 text-[13px]">
          {[
            ['Sea', w.sea],
            ['Sky', w.sky],
            ["Manish's status", w.ali],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-lilac">{k}</dt>
              <dd className="m-0">{v}</dd>
            </div>
          ))}
        </dl>
      </AppBody>
    </div>
  )
}

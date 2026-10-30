import { wallpaper } from '../../lib/sky'
import { AppBody, AppHeader, useTod } from '../shared'
import { usePhone } from '../usePhone'

export function CameraApp() {
  const tod = useTod()
  const photo = usePhone((s) => s.photo)
  const shots = usePhone((s) => s.shots)
  const toggle = usePhone((s) => s.togglePhoto)

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-shadow">
      <AppHeader title="Camera" />
      <AppBody className="flex flex-col items-center gap-3.5 px-3.5 py-[18px] text-center">
        <div className="flex aspect-[3/4] w-full items-center justify-center border-2 border-cream" style={{ background: wallpaper(tod) }}>
          <span className="font-ui text-[10px] text-cream [text-shadow:1px_1px_0_#0A0918]">live: {tod.clock}</span>
        </div>
        <span className="text-[13px] text-[#E4D6E8]">Photo mode hides all the text, so you can take a clean picture of the city.</span>
        <button type="button" onClick={toggle} className="min-h-12 w-full cursor-pointer border-2 border-cream bg-accent font-ui text-[12px] text-night">
          {photo ? 'Exit photo mode' : 'Enter photo mode'}
        </button>
        <span className="font-ui text-[10px] text-lilac">{shots} shots taken tonight</span>
      </AppBody>
    </div>
  )
}

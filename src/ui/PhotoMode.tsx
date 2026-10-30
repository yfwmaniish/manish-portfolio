import { usePhone } from '../phone/usePhone'

/** Viewfinder over a clean screen: corners, shot count, shutter, and the flash. */
export function PhotoMode() {
  const photo = usePhone((s) => s.photo)
  const flash = usePhone((s) => s.flash)
  const shots = usePhone((s) => s.shots)
  const { snap, togglePhoto } = usePhone.getState()

  return (
    <>
      {flash && <div className="pointer-events-none fixed inset-0 z-40 bg-[#FFF8EC] motion-safe:animate-[flashFade_.35s_both]" />}
      {photo && (
        <div className="pointer-events-none fixed inset-0 z-30">
          {[
            'left-8 top-[90px] border-l-4 border-t-4',
            'right-8 top-[90px] border-r-4 border-t-4',
            'bottom-8 left-8 border-b-4 border-l-4',
            'bottom-8 right-8 border-b-4 border-r-4',
          ].map((c) => (
            <span key={c} className={`absolute h-12 w-12 border-cream ${c}`} />
          ))}
          <span className="absolute left-1/2 top-24 -translate-x-1/2 font-ui text-[12px] tracking-[2px] text-cream">
            <span className="text-[#FF5A5A] motion-safe:animate-[recBlink_1s_steps(1)_infinite]">●</span> Photo mode · {shots} shots
          </span>
          <div className="pointer-events-auto absolute bottom-11 left-1/2 flex -translate-x-1/2 items-center gap-3.5">
            <button
              type="button"
              onClick={snap}
              aria-label="Take a photo"
              className="h-[68px] w-[68px] cursor-pointer rounded-full border-[5px] border-shadow bg-cream shadow-[0_0_0_4px_#F7EAD7]"
            />
            <button type="button" onClick={togglePhoto} className="min-h-11 cursor-pointer border-2 border-cream bg-shadow/85 px-3.5 font-ui text-[12px] text-cream">
              Exit
            </button>
          </div>
        </div>
      )}
    </>
  )
}

import { useEffect, useRef } from 'react'
import { CONTACT } from '../data/chat'
import { FLYERS } from '../data/flyers'
import { PAGES } from '../data/pages'
import { clearSave } from '../engine/save'
import { usePhone } from '../phone/usePhone'
import { useStore } from '../store/useStore'

/**
 * First light: the ending card, after Ali's last line at sunrise. A recap built from
 * what you did all night (DRAFT lines, written for this build), the moments count
 * and the prototype's buttons.
 */
export function Ending() {
  const open = useStore((s) => s.endingOpen)
  const flags = useStore((s) => s.flags)
  const moments = useStore((s) => Object.keys(s.moments).length)
  const flyers = useStore((s) => s.flyersCaught.length)
  const balloons = useStore((s) => s.balloonsFreed)
  const pages = useStore((s) => s.pagesFound.length)
  const close = () => useStore.setState({ endingOpen: false })
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (open) heading.current?.focus()
  }, [open])
  if (!open) return null

  // DRAFT lines, Manish to approve.
  const recap = [
    pages >= PAGES.length
      ? `You found all ${PAGES.length} of Manish’s pages. He gave you the notebook to keep.`
      : pages
        ? `You found ${pages} of Manish’s ${PAGES.length} pages. The rest are still out there.`
        : 'Manish’s pages are still blowing down the promenade.',
    flags.talked_ali ? 'You stopped to talk. Most people don’t.' : 'You never said hi to Manish. He noticed, but he won’t say it.',
    flags.chai_debt_paid
      ? 'You paid Manish’s chai bill. He still doesn’t know how to thank you.'
      : flags.chai_bought
        ? 'You had a cutting chai. Fifteen rupees, well spent.'
        : null,
    flags.took_portrait ? 'You took his picture under the streetlight. He hasn’t asked you to delete it.' : null,
    balloons ? `You let ${balloons} balloon${balloons > 1 ? 's' : ''} go. The balloon wala is still doing the maths.` : null,
    flags.cat_follows ? 'The indie chose you. It’s still sitting by your feet, tail going.' : null,
    flyers ? `You caught ${flyers} of ${FLYERS.length} flyers out of the wind.` : null,
  ].filter(Boolean)

  const again = () => {
    clearSave()
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center overflow-auto bg-[#2B3866]/40 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="ending-title" className="flex w-full max-w-[680px] flex-col items-center gap-5 text-center">
        <span className="bg-[#FFDCA8] px-3 py-1.5 font-ui text-[13px] tracking-[2px] text-ink">Scene 06 · 5:48 AM</span>
        <h2
          id="ending-title"
          ref={heading}
          tabIndex={-1}
          className="m-0 font-display text-[clamp(44px,7.5vw,96px)] leading-none text-cream outline-none [text-shadow:4px_4px_0_#3A2550,8px_8px_0_#0A0918]"
        >
          First light.
        </h2>
        <span className="bg-[rgba(255,234,210,.85)] px-3 py-1.5 font-ui text-[12px] tracking-wider text-ink">Pages · {pages} / {PAGES.length} · Moments · {moments} / 8</span>
        <ul className="m-0 flex list-none flex-col gap-1 p-0 font-display text-[19px] text-cream [text-shadow:2px_2px_0_#0A0918]">
          {recap.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className="flex flex-wrap justify-center gap-3.5">
          <button
            type="button"
            onClick={() => {
              close()
              usePhone.getState().openPhone('messages')
            }}
            className="cursor-pointer border-[3px] border-shadow bg-accent px-6 py-4 font-display text-[21px] text-night shadow-[6px_6px_0_#0A0918]"
          >
            › Text Manish
          </button>
          <a href={CONTACT.github.href} target="_blank" rel="noreferrer" className="border-[3px] border-shadow bg-cream px-6 py-4 font-display text-[21px] text-ink no-underline shadow-[6px_6px_0_#0A0918]">
            › GitHub
          </a>
          <a href={CONTACT.resume.href} target="_blank" rel="noreferrer" className="border-[3px] border-shadow bg-cream px-6 py-4 font-display text-[21px] text-ink no-underline shadow-[6px_6px_0_#0A0918]">
            › {CONTACT.resume.label}
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={close} className="min-h-11 cursor-pointer border-0 bg-[rgba(255,234,210,.85)] px-4 font-ui text-[12px] tracking-wider text-ink">
            Stay a while
          </button>
          <button type="button" onClick={again} className="min-h-11 cursor-pointer border-0 bg-[rgba(255,234,210,.85)] px-4 font-ui text-[12px] tracking-wider text-ink">
            ↺ Live the evening again
          </button>
        </div>
      </section>
    </div>
  )
}

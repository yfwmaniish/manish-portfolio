import { useEffect, useRef } from 'react'
import { pageById, PAGES } from '../data/pages'
import { useStore } from '../store/useStore'
import { PageContent } from './PageContent'

/** A notebook page you just picked up, held close enough to read. */
export function PageCard() {
  const id = useStore((s) => s.openPage)
  const found = useStore((s) => s.pagesFound.length)
  const close = useStore((s) => s.closePage)
  const button = useRef<HTMLButtonElement>(null)
  const page = id ? pageById(id) : undefined

  useEffect(() => {
    if (!page) return
    button.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [page, close])

  if (!page) return null
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center overflow-auto bg-shadow/55 p-4" onClick={close} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="page-title"
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-[420px] rotate-[1deg] flex-col border-[3px] border-shadow bg-[#FBF3E4] text-ink shadow-[8px_8px_0_#0A0918] motion-safe:animate-[drop_.45s_both]"
      >
        {/* a torn top edge, like it came out of a spiral notebook */}
        <div aria-hidden="true" className="flex h-3 justify-around bg-[#FBF3E4]">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="mt-1 h-2 w-2 bg-shadow/70" />
          ))}
        </div>
        <div className="ml-5 flex flex-col gap-3 border-l-2 border-[#E07070] pb-5 pl-5 pr-6 pt-3">
          <span className="font-ui text-[10px] tracking-[2px] text-plum">PAGE FOUND · {found} OF {PAGES.length}</span>
          <h2 id="page-title" className="m-0 font-display text-[30px] font-bold leading-none">
            {page.title}
          </h2>
          <PageContent page={page} />
        </div>
        <div className="flex items-center justify-between gap-3 bg-shadow px-3 py-2">
          <span className="font-ui text-[10px] text-lamp-hot">saved in the phone's Notebook app</span>
          <button ref={button} type="button" onClick={close} className="min-h-11 cursor-pointer border-2 border-cream bg-transparent px-3 font-ui text-[11px] text-cream">
            Keep it
          </button>
        </div>
      </div>
    </div>
  )
}

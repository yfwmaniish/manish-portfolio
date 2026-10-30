import { useState } from 'react'
import { pageById, PAGES } from '../../data/pages'
import { useStore } from '../../store/useStore'
import { PageContent } from '../../ui/PageContent'
import { AppBody, AppHeader } from '../shared'

/**
 * Manish's notebook, rebuilt from the pages you've found. Missing pages show as torn
 * stubs with a hint of where the wind took them. (Everything on them is also in
 * Gallery, Notes and Contact, so nothing is ever locked away.)
 */
export function Pages() {
  const found = useStore((s) => s.pagesFound)
  const [open, setOpen] = useState<string | null>(null)
  const page = open ? pageById(open) : undefined

  if (page) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-[#FBF3E4] text-ink">
        <AppHeader title={page.title} onBack={() => setOpen(null)} backLabel="Back to the notebook" light />
        <AppBody className="flex flex-col gap-3 p-4">
          <PageContent page={page} />
        </AppBody>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#FBF3E4] text-ink">
      <AppHeader title={`Notebook · ${found.length}/${PAGES.length}`} light />
      <AppBody className="flex flex-col gap-2 p-3">
        <p className="m-0 text-[12px] text-plum">The wind blew Manish's pages down the promenade. Find them on your walk.</p>
        <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0">
          {PAGES.map((p, i) => {
            const have = found.includes(p.id)
            return (
              <li key={p.id}>
                {have ? (
                  <button
                    type="button"
                    onClick={() => setOpen(p.id)}
                    className="flex min-h-[72px] w-full cursor-pointer flex-col justify-between gap-1 border-2 border-shadow bg-cream p-2 text-left font-[inherit] text-ink shadow-[2px_2px_0_#0A0918]"
                  >
                    <span className="font-ui text-[9px] text-plum">page {i + 1}</span>
                    <span className="font-display text-[16px] leading-tight">{p.title}</span>
                  </button>
                ) : (
                  <div className="flex min-h-[72px] flex-col justify-between gap-1 border-2 border-dashed border-plum/50 p-2">
                    <span className="font-ui text-[9px] text-plum">page {i + 1} · missing</span>
                    <span className="text-[11px] leading-snug text-[#5A4060]">{p.where}</span>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </AppBody>
    </div>
  )
}

import { MOMENTS } from '../../data/moments'
import { useStore } from '../../store/useStore'
import { AppBody, AppHeader } from '../shared'

export function Moments() {
  const found = useStore((s) => s.moments)
  const count = MOMENTS.filter((m) => found[m.id]).length
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-night">
      <AppHeader title={`Moments · ${count}/8`} />
      <AppBody className="flex flex-col gap-1.5 p-3">
        {MOMENTS.map((m) => {
          const done = !!found[m.id]
          return (
            <div key={m.id} className={`flex items-center gap-2.5 border-2 border-[#2A1F45] p-2.5 ${done ? 'bg-[#2A1F45]' : ''}`}>
              <span className="font-display text-[18px]" style={{ color: done ? '#FFE3A8' : '#5A4D6E' }} aria-hidden="true">
                ★
              </span>
              <div className="flex flex-col">
                <span className="font-display text-[16px]" style={{ color: done ? '#F7EAD7' : '#C9B8D6' }}>
                  {done ? m.title : '???'}
                  <span className="sr-only">{done ? ', found' : ', not found yet'}</span>
                </span>
                <span className="font-ui text-[9px] text-lilac">{done ? 'found' : m.hint}</span>
              </div>
            </div>
          )
        })}
      </AppBody>
    </div>
  )
}

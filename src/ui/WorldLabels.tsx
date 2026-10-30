import { Anchored } from '../engine/anchors'
import { useInteractables } from '../engine/interactables'
import { useStore } from '../store/useStore'

/** The bobbing "…", "!" and "?" over people you haven't met, and speech bubbles. */
export function WorldLabels() {
  const flags = useStore((s) => s.flags)
  const catMet = useStore((s) => s.catPets > 0 || !!s.flags.cat_follows)
  const speech = useStore((s) => s.speech)
  const items = useInteractables((s) => s.items)

  const markers = [
    { id: 'ali', label: '…', color: '#FF8A4C', show: !flags.talked_ali },
    { id: 'vendor', label: '!', color: '#E7C55A', show: !flags.talked_vendor },
    { id: 'cat', label: '?', color: '#C9B8D6', show: !catMet },
    { id: 'ali2', label: '…', color: '#FF8A4C', show: !flags.met_ali2 },
    { id: 'ali3', label: '…', color: '#FF8A4C', show: !flags.met_ali3 },
    { id: 'ali4', label: '…', color: '#FF8A4C', show: !flags.met_ali4 },
    { id: 'ali5', label: '…', color: '#FF8A4C', show: !flags.met_ali5 },
    { id: 'ali6', label: '…', color: '#FF8A4C', show: !flags.met_ali6 },
  ]

  return (
    <>
      {markers.map(
        (m) =>
          m.show && (
            <Anchored key={`marker-${m.id}`} id={`marker-${m.id}`}>
              <button
                type="button"
                onClick={() => items[m.id]?.activate()}
                aria-label={items[m.id]?.label ?? m.id}
                className="pointer-events-auto mb-1 flex h-11 min-w-11 cursor-pointer items-end justify-center border-0 bg-transparent p-0"
              >
                <span
                  className="mb-1 block border-[3px] border-shadow px-2 font-display text-[18px] font-bold leading-6 text-night shadow-[2px_2px_0_#0A0918] motion-safe:animate-[bob_1.2s_ease-in-out_infinite]"
                  style={{ background: m.color }}
                >
                  {m.label}
                </span>
              </button>
            </Anchored>
          ),
      )}
      {Object.entries(speech).map(([id, text]) => (
        <Anchored key={`say-${id}`} id={`say-${id}`}>
          <div className="mb-2 whitespace-nowrap border-2 border-shadow bg-cream px-2 py-0.5 font-display text-[15px] text-ink shadow-[3px_3px_0_#0A0918] motion-safe:animate-[pop_.25s_steps(3)_both]">
            {text}
          </div>
        </Anchored>
      ))}
    </>
  )
}

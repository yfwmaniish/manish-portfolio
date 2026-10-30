// One-shot cues from the story to the world ("pour", "pet", …). Things that persist
// (a paid tab, a cat that follows you) are flags in the store instead.

export type Cue = 'pour' | 'pet' | 'cash' | 'snap' | 'whistle'

type Listener = () => void
const listeners = new Map<Cue, Set<Listener>>()

export function emit(cue: Cue) {
  listeners.get(cue)?.forEach((fn) => fn())
}

export function on(cue: Cue, fn: Listener) {
  if (!listeners.has(cue)) listeners.set(cue, new Set())
  listeners.get(cue)!.add(fn)
  return () => {
    listeners.get(cue)?.delete(fn)
  }
}

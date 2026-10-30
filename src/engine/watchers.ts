import { timeOfDay } from '../lib/time'
import { effectiveP, useStore } from '../store/useStore'

/**
 * Moments that come from the night itself, as in the prototype's componentDidUpdate:
 * caught in the rain, and staying till sunrise. (The ending comes from the story, in Scene 6.)
 */
export function initWatchers() {
  return useStore.subscribe((s, prev) => {
    const p = effectiveP(s)
    if (p === effectiveP(prev)) return
    const t = timeOfDay(p)
    if (t.rain > 0.6) s.unlock('rain')
    if (p >= 0.95) s.unlock('dawn')
  })
}

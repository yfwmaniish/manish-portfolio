import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { advance } from './story'

const WHEEL_TO_UNITS = 0.012
const KEY_STEP = 3
const TOUCH_TO_UNITS = 0.03

/**
 * Wheel, touch and arrow keys walk you along the promenade.
 * The page itself never scrolls; scrolling is walking.
 */
export function useWalkInput() {
  useEffect(() => {
    const { walkBy, setPointer } = useStore.getState()

    // While talking, scrolling reads on (once per flick) instead of walking.
    let lastRead = 0
    const busy = () => {
      const s = useStore.getState()
      return !s.started || !!(s.dialogue || s.phoneOpen || s.openFlyer || s.openPage || s.endingOpen)
    }
    const onWheel = (e: WheelEvent) => {
      // Trackpads send sideways swipes as deltaX; both mean "walk".
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (busy()) {
        if (useStore.getState().dialogue && d > 0 && e.timeStamp - lastRead > 350) {
          lastRead = e.timeStamp
          advance()
        }
        return
      }
      walkBy(d * WHEEL_TO_UNITS)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || busy()) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') walkBy(KEY_STEP)
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') walkBy(-KEY_STEP)
      else return
      e.preventDefault()
    }
    let lastTouch: { x: number; y: number } | null = null
    const onTouchStart = (e: TouchEvent) => {
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!lastTouch || busy()) return
      const t = e.touches[0]
      const dx = lastTouch.x - t.clientX
      const dy = lastTouch.y - t.clientY
      walkBy((Math.abs(dx) > Math.abs(dy) ? dx : dy) * TOUCH_TO_UNITS)
      lastTouch = { x: t.clientX, y: t.clientY }
    }
    const onMove = (e: PointerEvent) => {
      setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])
}

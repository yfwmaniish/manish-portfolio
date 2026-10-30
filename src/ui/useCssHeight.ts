import { useEffect, type RefObject } from 'react'

/**
 * Keeps a CSS variable on <html> equal to how much room an element takes up, so
 * other overlays can stay clear of it. `edge` 'bottom' measures from the top of the
 * screen to the element's bottom (the HUD); 'height' is just its height (the
 * dialogue box). Resets to `empty` when the element goes away.
 */
export function useCssHeight(ref: RefObject<HTMLElement | null>, name: string, edge: 'bottom' | 'height', empty = '0px') {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const root = document.documentElement
    const update = () => {
      const r = el.getBoundingClientRect()
      root.style.setProperty(name, `${Math.ceil((edge === 'bottom' ? r.bottom : r.height) + 10)}px`)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
      root.style.setProperty(name, empty)
    }
  })
}

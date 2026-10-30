import { useEffect, useRef, useState } from 'react'
import { sound } from '../audio/bus'
import { SCENES, type Scene } from '../data/scenes'
import { useStore } from '../store/useStore'

const SHOW_MS = 3200
/** How close (world units) you need to be for a scene's chapter to begin. */
const NEAR = 5

/**
 * Like a chapter break in a storybook: the first time you reach each scene, its
 * number, name and time fade in over the world, then away. It never blocks input.
 */
export function ChapterCard() {
  const [scene, setScene] = useState<Scene | null>(null)
  const seen = useRef(new Set<string>())

  useEffect(() => {
    let timer: number | undefined
    const check = () => {
      const s = useStore.getState()
      if (!s.started || s.dialogue || s.phoneOpen || s.endingOpen || timer) return
      const next = SCENES.find((sc) => !seen.current.has(sc.id) && Math.abs(sc.x - s.walkTarget) < NEAR)
      if (!next) return
      seen.current.add(next.id)
      setScene(next)
      sound('sting')
      timer = window.setTimeout(() => {
        setScene(null)
        timer = undefined
      }, SHOW_MS)
    }
    check()
    const unsub = useStore.subscribe(check)
    return () => {
      unsub()
      window.clearTimeout(timer)
    }
  }, [])

  if (!scene) return null
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-[22%] z-[15] flex flex-col items-center gap-1 bg-[linear-gradient(90deg,transparent,rgba(10,9,24,.72)_25%,rgba(10,9,24,.72)_75%,transparent)] py-5 text-center motion-safe:animate-[chapter_3.2s_ease-in-out_both]"
    >
      <span className="font-ui text-[12px] tracking-[4px] text-lamp-hot">CHAPTER {Number(scene.num)}</span>
      <span className="font-display text-[clamp(34px,6vw,60px)] font-bold leading-none text-cream [text-shadow:3px_3px_0_#0A0918]">{scene.title}</span>
      <span className="font-ui text-[12px] tracking-[3px] text-cream/90">{scene.time}</span>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import type { Mood, Who } from '../portraits/art'
import { PORTRAIT_H, PORTRAIT_W, portraitFrame } from '../portraits/raster'

const FLAP_MS = 110

/**
 * A visual-novel bust: blinks every few seconds, and its mouth flaps while the line
 * is still typing out. Drawn at whole-pixel scale so it matches the world.
 */
export function Portrait({ who, mood, talking, scale }: { who: Who; mood: Mood; talking: boolean; scale: number }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [blink, setBlink] = useState(false)
  const [mouth, setMouth] = useState(false)

  // blink: shut for a beat, every 2–5 s
  useEffect(() => {
    let t: number
    const loop = () => {
      t = window.setTimeout(() => {
        setBlink(true)
        t = window.setTimeout(() => {
          setBlink(false)
          loop()
        }, 130)
      }, 2000 + Math.random() * 3000)
    }
    loop()
    return () => window.clearTimeout(t)
  }, [])

  // talk: open and shut while typing
  useEffect(() => {
    if (!talking) {
      setMouth(false)
      return
    }
    const id = window.setInterval(() => setMouth((m) => !m), FLAP_MS)
    return () => window.clearInterval(id)
  }, [talking])

  useEffect(() => {
    let live = true
    portraitFrame(who, { mood, blink, talk: mouth }).then((src) => {
      const g = canvas.current?.getContext('2d')
      if (!live || !g) return
      g.clearRect(0, 0, PORTRAIT_W, PORTRAIT_H)
      g.drawImage(src, 0, 0)
    })
    return () => {
      live = false
    }
  }, [who, mood, blink, mouth])

  return (
    <canvas
      ref={canvas}
      width={PORTRAIT_W}
      height={PORTRAIT_H}
      aria-hidden="true"
      className="block [image-rendering:pixelated]"
      style={{ width: PORTRAIT_W * scale, height: PORTRAIT_H * scale }}
    />
  )
}

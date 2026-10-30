import { useEffect, useRef, type ReactNode } from 'react'
import type { Vector3 } from 'three'

// Labels that ride on things in the 3D world (markers, speech bubbles) are plain DOM
// in the UI layer. 3D components register an anchor point; <Projector/> moves each
// label's element to its anchor every frame (see world/Projector.tsx). One overlay
// instead of a React root per label.

export const anchors = new Map<string, () => Vector3 | null>()
export const elements = new Map<string, HTMLElement>()

/** From a 3D component: where label `id` should sit, in world space (null = hide). */
export function useAnchor(id: string, where: () => Vector3 | null) {
  const latest = useRef(where)
  latest.current = where
  useEffect(() => {
    anchors.set(id, () => latest.current())
    return () => {
      anchors.delete(id)
    }
  }, [id])
}

/** In the DOM: a label that follows anchor `id`. */
export function Anchored({ id, children }: { id: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    elements.set(id, el)
    return () => {
      elements.delete(id)
    }
  }, [id])
  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[15]" style={{ visibility: 'hidden' }}>
      {children}
    </div>
  )
}

import { useEffect, useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { Object3D } from 'three'
import { create } from 'zustand'
import { useStore } from '../store/useStore'

// Every clickable thing in the 3D world registers here, so the same action is
// available as a real button (keyboard, screen readers) — see <HotspotList/>.
// Its click box registers too (by id), so world effects know where it stands:
// the "!" over it, the ring under it on hover, the bounce when you click it.

interface Item {
  id: string
  label: string
  /** Current world x, so the list only offers what is near you. */
  x: () => number
  /** False while it isn't there to see (out of hours, hidden by weather). */
  shown: () => boolean
  activate: () => void
}

interface Registry {
  items: Record<string, Item>
  add: (item: Item) => void
  remove: (id: string) => void
}

/** Each interactable's click box, by id: set by <HitBox/>. */
export const hitObjects = new Map<string, Object3D>()

type Listener = (id: string) => void
const listeners = new Set<Listener>()

/** Hear about every interaction, however it happened (click, tap or keyboard). */
export function onInteract(fn: Listener) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function interacted(id: string) {
  useStore.getState().touch(id)
  listeners.forEach((fn) => fn(id))
}

export const useInteractables = create<Registry>((set) => ({
  items: {},
  add: (item) => set((s) => ({ items: { ...s.items, [item.id]: item } })),
  remove: (id) =>
    set((s) => {
      const items = { ...s.items }
      delete items[id]
      return { items }
    }),
}))

/**
 * Registers an interactable and returns pointer handlers to spread on its hit mesh.
 * `enabled: false` removes it (e.g. a flyer that blew away).
 */
export function useInteractable(opts: {
  id: string
  label: string
  x: () => number
  onActivate: () => void
  enabled?: boolean
  /** For things that come and go (by time of night, weather): are they there now? */
  shown?: () => boolean
}) {
  const latest = useRef(opts)
  latest.current = opts
  const enabled = opts.enabled ?? true

  useEffect(() => {
    if (!enabled) return
    const { add, remove } = useInteractables.getState()
    add({
      id: opts.id,
      label: opts.label,
      x: () => latest.current.x(),
      shown: () => latest.current.shown?.() ?? true,
      activate: () => {
        interacted(opts.id)
        latest.current.onActivate()
      },
    })
    return () => {
      remove(opts.id)
      if (useStore.getState().hovered?.id === opts.id) setHover(null)
    }
  }, [opts.id, opts.label, enabled])

  return {
    /** Lets the click box register itself under this id. */
    name: opts.id,
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      if (enabled) setHover({ id: opts.id, label: latest.current.label })
    },
    onPointerOut: () => {
      if (useStore.getState().hovered?.id === opts.id) setHover(null)
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (!enabled) return
      interacted(opts.id)
      latest.current.onActivate()
    },
  }
}

function setHover(h: { id: string; label: string } | null) {
  useStore.getState().setHovered(h)
  document.body.style.cursor = h ? 'pointer' : ''
}

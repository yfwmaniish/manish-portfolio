import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshToonMaterial, NearestFilter, SRGBColorSpace } from 'three'
import { useInteractable } from '../../engine/interactables'
import { useStore } from '../../store/useStore'
import { CharLayer, HitBox } from '../characters/shared'
import { frame } from '../frame'
import { ramp } from '../materials'

// One of Ali's notebook pages, lying where the wind left it. It lifts at the corner
// in the breeze and glints so you can spot it. Click it to pick it up.

function pixelTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!)
  const t = new CanvasTexture(c)
  t.magFilter = t.minFilter = NearestFilter
  t.colorSpace = SRGBColorSpace
  return t
}

let paperMat: MeshToonMaterial | null = null
let glintMat: MeshBasicMaterial | null = null

/** Lined notebook paper, 10×12 pixels, with the spiral holes along the top. */
function paper() {
  paperMat ??= new MeshToonMaterial({
    gradientMap: ramp,
    side: DoubleSide,
    map: pixelTexture(10, 12, (g) => {
      g.fillStyle = '#FBF3E4'
      g.fillRect(0, 0, 10, 12)
      g.fillStyle = '#9DB4D8'
      for (let y = 3; y < 12; y += 2) g.fillRect(1, y, 8, 1)
      g.fillStyle = '#E07070'
      g.fillRect(2, 2, 1, 10)
      g.fillStyle = '#3A3048'
      for (let x = 1; x < 10; x += 2) g.fillRect(x, 0, 1, 1)
    }),
  })
  return paperMat
}

/** A little four-point sparkle. */
function glint() {
  glintMat ??= new MeshBasicMaterial({
    alphaTest: 0.5,
    map: pixelTexture(7, 7, (g) => {
      g.fillStyle = '#FFF4C8'
      g.fillRect(3, 0, 1, 7)
      g.fillRect(0, 3, 7, 1)
      g.fillStyle = '#FFFFFF'
      g.fillRect(2, 2, 3, 3)
    }),
  })
  return glintMat
}

/** How long it takes to flutter down when it first appears. */
const FALL = 1.4

export function PageSheet({
  id,
  x,
  z,
  y = 0.02,
  show = true,
  from,
  upright = false,
}: {
  id: string
  x: number
  z: number
  /** Height it rests at (0 is the promenade floor). */
  y?: number
  /** Hidden pages appear when their puzzle is solved. */
  show?: boolean
  /** Where it flutters down from when it appears. */
  from?: [number, number, number]
  /** Stuck flat to a wall or glass, facing you, instead of lying on the ground. */
  upright?: boolean
}) {
  const found = useStore((s) => s.pagesFound.includes(id))
  const findPage = useStore((s) => s.findPage)
  const root = useRef<Group>(null)
  const sheet = useRef<Group>(null)
  const sparkle = useRef<Mesh>(null)
  const shownAt = useRef<number | null>(null)
  const seed = useMemo(() => Math.random() * 10, [])
  const here = show && !found

  const handlers = useInteractable({
    id: `page-${id}`,
    label: 'Pick up the page',
    x: () => x,
    enabled: here,
    onActivate: () => findPage(id),
  })

  useFrame(() => {
    const g = root.current
    if (!g) return
    g.visible = here
    if (!here) {
      shownAt.current = null
      return
    }
    shownAt.current ??= frame.time
    const t = frame.time
    const since = (t - shownAt.current) / FALL
    if (from && since < 1) {
      // drifting down, rocking side to side like paper does
      const k = since * since * (3 - 2 * since)
      g.position.set(from[0] + (x - from[0]) * k + Math.sin(since * 9) * 0.15 * (1 - k), from[1] + (y - from[1]) * k, from[2] + (z - from[2]) * k)
      if (sheet.current) sheet.current.rotation.set(-Math.PI / 2 + Math.sin(since * 11) * 0.7 * (1 - k), 0, Math.sin(since * 7) * 0.5)
    } else {
      g.position.set(x, y, z)
      // a corner lifting in the sea breeze (or, stuck to glass, just trembling)
      const lift = Math.max(0, Math.sin(t * 1.3 + seed))
      if (sheet.current)
        sheet.current.rotation.set(upright ? lift * 0.08 : -Math.PI / 2 + 0.12 + lift * 0.18, 0, upright ? 0.12 : 0.3)
    }
    if (sparkle.current) {
      const pulse = Math.max(0, Math.sin(t * 2.4 + seed))
      sparkle.current.scale.setScalar(0.05 + pulse * 0.13)
      sparkle.current.rotation.z = t * 0.8
    }
  })

  return (
    <group ref={root} position={[x, y, z]} visible={false}>
      <CharLayer>
        <group ref={sheet} rotation-x={-Math.PI / 2}>
          <mesh material={paper()}>
            <planeGeometry args={[0.26, 0.32]} />
          </mesh>
        </group>
        <mesh ref={sparkle} material={glint()} position={[0.12, 0.18, 0.05]}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      </CharLayer>
      {here && <HitBox size={[0.55, 0.45, 0.55]} position={[0, 0.15, 0]} {...handlers} />}
    </group>
  )
}

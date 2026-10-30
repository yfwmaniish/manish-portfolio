import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame, useThree, type ThreeElements } from '@react-three/fiber'
import { CanvasTexture, Group, Mesh, MeshBasicMaterial, NearestFilter, SRGBColorSpace, type Light, type Object3D } from 'three'
import { CAM_Z } from '../FrameDriver'
import { frame, LAYER_CHAR, LAYER_HIT } from '../frame'
import { hitObjects } from '../../engine/interactables'
import { useStore } from '../../store/useStore'

/** Puts everything inside on the finer character layer. */
export function CharLayer({ children, ...props }: { children: ReactNode } & ThreeElements['group']) {
  const ref = useRef<Group>(null)
  useLayoutEffect(() => {
    ref.current?.traverse((o) => {
      // Lights keep shining on every layer, or each render pass would see a
      // different set of lights and swap shaders mid-frame.
      if ((o as Light).isLight) return o.layers.enableAll()
      if (!o.layers.isEnabled(LAYER_HIT)) o.layers.set(LAYER_CHAR)
    })
  })
  return (
    <group ref={ref} {...props}>
      {children}
    </group>
  )
}

// Add ?hits to the URL (dev only) to see every click area as a red wireframe.
const SHOW_HITS = import.meta.env.DEV && typeof location !== 'undefined' && location.search.includes('hits')
const hitMaterial = SHOW_HITS ? new MeshBasicMaterial({ color: '#FF2040', wireframe: true }) : new MeshBasicMaterial({ visible: false })

/** Is this object actually on screen: it and every parent visible? */
function shown(o: Object3D | null) {
  for (let p = o; p; p = p.parent) if (!p.visible) return false
  return true
}

/**
 * An invisible box you can click, bigger than the thing it belongs to. Three.js
 * raycasts hidden objects too, so it ignores the pointer whenever its owner is
 * hidden (the umbrella seller when it's dry, the cop before midnight…).
 */
export function HitBox({ size, ...props }: { size: [number, number, number] } & ThreeElements['mesh']) {
  const ref = useRef<Mesh>(null)
  const id = props.name
  useLayoutEffect(() => {
    if (!id || !ref.current) return
    hitObjects.set(id, ref.current)
    return () => {
      if (hitObjects.get(id) === ref.current) hitObjects.delete(id)
    }
  }, [id])
  useLayoutEffect(() => {
    ref.current?.layers.set(LAYER_HIT)
    // drawn with the characters so it shows; raycasting sees every layer anyway
    if (SHOW_HITS) ref.current?.layers.enable(LAYER_CHAR)
  }, [])
  return (
    <mesh
      ref={ref}
      material={hitMaterial}
      raycast={function (this: Mesh, rc, hits) {
        if (shown(this)) Mesh.prototype.raycast.call(this, rc, hits)
      }}
      {...props}
    >
      <boxGeometry args={size} />
    </mesh>
  )
}

/** Where the pointer is, in world x, on the plane at depth z. */
export function usePointerWorldX() {
  const camera = useThree((s) => s.camera)
  return (z: number) => {
    const { pointer } = useStore.getState()
    const cam = camera as unknown as { fov: number; aspect: number }
    const halfH = (CAM_Z - z) * Math.tan(((cam.fov / 2) * Math.PI) / 180)
    return frame.camX + pointer.x * halfH * cam.aspect
  }
}

// A 7×6 pixel heart.
const HEART = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...']

export function useHeartMaterial() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 7
    c.height = 6
    const g = c.getContext('2d')!
    HEART.forEach((row, y) =>
      [...row].forEach((ch, x) => {
        if (ch === 'X') {
          g.fillStyle = y === 1 && x < 3 ? '#FFB3C1' : '#F0607A'
          g.fillRect(x, y, 1, 1)
        }
      }),
    )
    const t = new CanvasTexture(c)
    t.magFilter = t.minFilter = NearestFilter
    t.colorSpace = SRGBColorSpace
    return new MeshBasicMaterial({ map: t, alphaTest: 0.5 })
  }, [])
}

interface Heart { t: number; x: number; y: number; drift: number }

/** Little hearts that float up from a point. Call `burst()` to release some. */
export function useHearts(count = 6) {
  const meshes = useRef<(Mesh | null)[]>([])
  const pool = useRef<Heart[]>([])
  const material = useHeartMaterial()

  useFrame((_, dt) => {
    pool.current.forEach((h, i) => {
      h.t += dt
      const m = meshes.current[i]
      if (!m) return
      const life = h.t / 1.6
      m.visible = life < 1
      m.position.set(h.x + Math.sin(h.t * 4 + h.drift * 9) * 0.03 + h.drift * h.t * 0.1, h.y + h.t * 0.32, 0)
      const s = life < 0.15 ? life / 0.15 : 1 - Math.max(0, life - 0.6) / 0.4
      m.scale.setScalar(Math.max(0.001, s))
    })
  })

  const burst = (n = 3) => {
    for (let k = 0; k < n; k++) {
      const slot = pool.current.findIndex((h) => h.t > 1.6)
      const h = { t: -k * 0.18, x: (Math.random() - 0.5) * 0.1, y: 0, drift: Math.random() - 0.5 }
      if (slot >= 0) pool.current[slot] = h
      else if (pool.current.length < count) pool.current.push(h)
    }
  }

  const node = (
    <>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} ref={(m) => (meshes.current[i] = m)} material={material} visible={false}>
          <planeGeometry args={[0.105, 0.09]} />
        </mesh>
      ))}
    </>
  )
  return { burst, node }
}

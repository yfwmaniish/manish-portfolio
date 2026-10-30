import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box3, DoubleSide, Mesh, MeshBasicMaterial, Object3D, RingGeometry, Vector3 } from 'three'
import { sound } from '../../audio/bus'
import { anchors } from '../../engine/anchors'
import { hitObjects, onInteract } from '../../engine/interactables'
import { useStore } from '../../store/useStore'
import { frame, LAYER_CHAR, LAYER_FX } from '../frame'

// Makes clickable things feel clickable. Hover: a glowing ring on the ground and the
// thing leans in a little. Click: it squashes and bounces, pixel sparks burst off
// the top, a ring ripples out on the ground. Also places the "!" hint over each
// clickable thing (see <InteractHints/>), from its click box.

const SPARKS = 14
const BOUNCE_S = 0.5
const box = new Box3()
const tmp = new Vector3()

/** Is it on screen: itself and every parent visible? */
const shown = (o: Object3D) => {
  for (let p: Object3D | null = o; p; p = p.parent) if (!p.visible) return false
  return true
}

interface Bounce { obj: Object3D; base: Vector3; hover: number; t: number }

export function InteractFX() {
  const hoverRing = useRef<Mesh>(null)
  const ripple = useRef<Mesh>(null)
  const sparks = useRef<(Mesh | null)[]>([])
  const ringGeo = useMemo(() => new RingGeometry(0.42, 0.5, 20), [])
  const hoverMat = useMemo(() => new MeshBasicMaterial({ color: '#FFC56B', transparent: true, side: DoubleSide, depthWrite: false }), [])
  const rippleMat = useMemo(() => new MeshBasicMaterial({ color: '#FFE3A8', transparent: true, side: DoubleSide, depthWrite: false }), [])
  const sparkMats = useMemo(() => ['#FFE3A8', '#FFC56B', '#FF8A4C', '#F7EAD7'].map((c) => new MeshBasicMaterial({ color: c })), [])
  const st = useRef({
    bounces: new Map<Object3D, Bounce>(),
    ripple: { t: 9, x: 0, z: 0, w: 1 },
    sparks: Array.from({ length: SPARKS }, () => ({ t: 9, p: new Vector3(), v: new Vector3() })),
  })

  /** The character the click box belongs to (its parent group), and its world box. */
  const target = (id: string) => {
    const hit = hitObjects.get(id)
    if (!hit || !hit.parent) return null
    box.setFromObject(hit)
    return { owner: hit.parent, box }
  }

  const bounceOf = (obj: Object3D) => {
    const b = st.current.bounces
    if (!b.has(obj)) b.set(obj, { obj, base: obj.scale.clone(), hover: 1, t: 9 })
    return b.get(obj)!
  }

  // a click, a tap or a key: squash, sparks, ripple, a soft pop
  useEffect(
    () =>
      onInteract((id) => {
        const tgt = target(id)
        if (!tgt) return
        bounceOf(tgt.owner).t = 0
        const c = st.current
        const cx = (tgt.box.min.x + tgt.box.max.x) / 2
        const cz = (tgt.box.min.z + tgt.box.max.z) / 2
        Object.assign(c.ripple, { t: 0, x: cx, z: cz, w: Math.max(0.6, tgt.box.max.x - tgt.box.min.x) })
        c.sparks.forEach((s, i) => {
          s.t = -i * 0.012
          s.p.set(cx, tgt.box.max.y - 0.05, cz)
          const a = (i / SPARKS) * Math.PI * 2
          s.v.set(Math.cos(a) * (0.9 + Math.random()), 2 + Math.random() * 1.6, Math.sin(a) * 0.5)
        })
        sound('select', { x: cx, rate: 1.1 })
      }),
    [],
  )

  // keep the "!" anchors in step with whatever click boxes exist right now
  useFrame(() => {
    for (const id of hitObjects.keys()) {
      const key = `hint-${id}`
      if (anchors.has(key)) continue
      const v = new Vector3()
      anchors.set(key, () => {
        const hit = hitObjects.get(id)
        if (!hit || !shown(hit)) return null
        box.setFromObject(hit)
        return v.set((box.min.x + box.max.x) / 2, box.max.y + 0.05, (box.min.z + box.max.z) / 2)
      })
    }
  })

  useFrame((_, dt) => {
    const c = st.current
    const t = frame.time
    // hover: ring on the ground, a gentle lean in
    const hovered = useStore.getState().hovered?.id
    const tgt = hovered ? target(hovered) : null
    if (hoverRing.current) {
      hoverRing.current.visible = !!tgt && shown(tgt.owner)
      if (tgt) {
        tgt.box.getCenter(tmp)
        const w = Math.max(0.5, Math.min(2.2, tgt.box.max.x - tgt.box.min.x))
        hoverRing.current.position.set(tmp.x, 0.03, tmp.z)
        hoverRing.current.scale.setScalar(w * (1 + Math.sin(t * 6) * 0.05))
        hoverMat.opacity = 0.65 + Math.sin(t * 6) * 0.2
        bounceOf(tgt.owner)
      }
    }
    for (const b of c.bounces.values()) {
      b.hover += ((tgt && tgt.owner === b.obj ? 1.05 : 1) - b.hover) * Math.min(1, dt * 12)
      b.t += dt
      // squash, then a springy stretch that settles
      const k = b.t < BOUNCE_S ? Math.sin((b.t / BOUNCE_S) * Math.PI * 3) * Math.exp(-b.t * 7) * 0.22 : 0
      const sy = 1 - k
      const sxz = 1 + k * 0.6
      b.obj.scale.set(b.base.x * b.hover * sxz, b.base.y * b.hover * sy, b.base.z * b.hover * sxz)
      if (b.t >= BOUNCE_S && Math.abs(b.hover - 1) < 0.002) {
        b.obj.scale.copy(b.base)
        c.bounces.delete(b.obj)
      }
    }
    // the ripple
    c.ripple.t += dt
    if (ripple.current) {
      const r = c.ripple.t / 0.55
      ripple.current.visible = r < 1
      if (r < 1) {
        ripple.current.position.set(c.ripple.x, 0.035, c.ripple.z)
        ripple.current.scale.setScalar(c.ripple.w * (0.6 + r * 1.6))
        rippleMat.opacity = 1 - r
      }
    }
    // the sparks: up and out, then down
    c.sparks.forEach((s, i) => {
      s.t += dt
      const m = sparks.current[i]
      if (!m) return
      m.visible = s.t > 0 && s.t < 0.7
      if (!m.visible) return
      s.v.y -= 7 * dt
      s.p.addScaledVector(s.v, dt)
      m.position.copy(s.p)
      m.scale.setScalar(1 - s.t / 0.7)
    })
  })

  return (
    <>
      <mesh ref={hoverRing} geometry={ringGeo} material={hoverMat} rotation-x={-Math.PI / 2} layers={LAYER_FX} visible={false} />
      <mesh ref={ripple} geometry={ringGeo} material={rippleMat} rotation-x={-Math.PI / 2} layers={LAYER_FX} visible={false} />
      {Array.from({ length: SPARKS }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            sparks.current[i] = m
            m?.layers.set(LAYER_CHAR)
          }}
          material={sparkMats[i % sparkMats.length]}
          visible={false}
        >
          <boxGeometry args={[0.05, 0.05, 0.05]} />
        </mesh>
      ))}
    </>
  )
}

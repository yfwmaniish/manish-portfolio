import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, MeshBasicMaterial, Object3D } from 'three'
import { useStore } from '../store/useStore'
import { frame } from './frame'
import { SHELTERS } from './scene3/BusStop'

const COUNT = 700
// Rain falls in a box around the camera; drops that leave it wrap round.
const SPAN_X = 22
const Z0 = -4
const Z1 = 4
const TOP = 7
const FALL = 11
const SLANT = -0.18

/** The monsoon shower: slanted streaks, only as many as the rain amount asks for. */
export function Rain() {
  const ref = useRef<InstancedMesh>(null)
  const material = useMemo(() => new MeshBasicMaterial({ color: '#A9BCE8', transparent: true, opacity: 0.7, depthWrite: false }), [])
  const drops = useMemo(
    () => Array.from({ length: COUNT }, (_, i) => ({ x: Math.random() * SPAN_X, y: Math.random() * TOP, z: Z0 + Math.random() * (Z1 - Z0), s: 0.8 + ((i * 7919) % 100) / 250 })),
    [],
  )
  const o = useMemo(() => new Object3D(), [])

  useLayoutEffect(() => {
    o.rotation.z = SLANT
  }, [o])

  useFrame((_, dt) => {
    const m = ref.current
    if (!m) return
    const amount = frame.tod.rain
    const n = Math.floor(COUNT * amount)
    m.count = n
    m.visible = n > 0
    if (!n) return
    // under your umbrella, the nearest band of rain stays off you
    const umbrella = useStore.getState().umbrellaOpen
    for (let i = 0; i < n; i++) {
      const d = drops[i]
      d.y -= FALL * d.s * dt
      d.x += FALL * d.s * dt * -SLANT
      if (d.y < 0) {
        d.y += TOP
        d.x = Math.random() * SPAN_X
      }
      const wx = frame.camX - SPAN_X / 2 + (((d.x % SPAN_X) + SPAN_X) % SPAN_X)
      const dry =
        (umbrella && d.z > 1.5) ||
        SHELTERS.some((s) => wx > s.x0 && wx < s.x1 && d.z > s.z0 && d.z < s.z1 && d.y < s.top)
      o.position.set(wx, d.y, d.z)
      o.scale.setScalar(dry ? 0 : 1)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, material, COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.015, 0.32, 0.015]} />
    </instancedMesh>
  )
}

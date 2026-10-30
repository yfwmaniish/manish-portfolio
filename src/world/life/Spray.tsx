import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, MeshBasicMaterial, Object3D } from 'three'
import { frame } from '../frame'
import { WALL_BACK_Z, WALL_TOP } from '../Promenade'

const COUNT = 36
const PER_BURST = 9
const LIFE = 0.9

interface Drop { x: number; y: number; z: number; vx: number; vy: number; t: number }

/** Waves hitting the tetrapods now and then throw spray up over the wall. */
export function Spray() {
  const ref = useRef<InstancedMesh>(null)
  const drops = useMemo<Drop[]>(() => Array.from({ length: COUNT }, () => ({ x: 0, y: 0, z: 0, vx: 0, vy: 0, t: LIFE })), [])
  const next = useRef(1.5)
  const o = useMemo(() => new Object3D(), [])
  const material = useMemo(() => new MeshBasicMaterial({ color: '#D8E4F4' }), [])

  useLayoutEffect(() => {
    // start hidden
    o.scale.setScalar(0)
    o.updateMatrix()
    for (let i = 0; i < COUNT; i++) ref.current!.setMatrixAt(i, o.matrix)
    ref.current!.instanceMatrix.needsUpdate = true
  }, [o])

  useFrame((_, dt) => {
    next.current -= dt
    if (next.current <= 0) {
      // rougher sea in the monsoon
      next.current = (2 + Math.random() * 4) * (1 - frame.tod.rain * 0.6)
      const bx = frame.camX + (Math.random() - 0.5) * 12
      let made = 0
      for (const d of drops) {
        if (d.t < LIFE || made >= PER_BURST) continue
        Object.assign(d, {
          x: bx + (Math.random() - 0.5) * 0.8,
          y: WALL_TOP - 0.1,
          z: WALL_BACK_Z - 0.2 - Math.random() * 0.4,
          vx: (Math.random() - 0.5) * 0.8,
          vy: 1.6 + Math.random() * 1.2,
          t: -made * 0.02,
        })
        made++
      }
    }
    const m = ref.current!
    drops.forEach((d, i) => {
      d.t += dt
      if (d.t < 0 || d.t >= LIFE) {
        o.scale.setScalar(0)
      } else {
        d.vy -= 6 * dt
        d.x += d.vx * dt
        d.y += d.vy * dt
        o.position.set(d.x, d.y, d.z)
        o.scale.setScalar(1 - d.t / LIFE)
      }
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    })
    m.instanceMatrix.needsUpdate = true
    // spray catches the lamp light at night, the sunset before that
    material.color.set(frame.tod.night > 0.5 ? '#B8C4E0' : '#F2DCD0')
  })

  return (
    <instancedMesh ref={ref} args={[undefined, material, COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.07, 0.07, 0.07]} />
    </instancedMesh>
  )
}

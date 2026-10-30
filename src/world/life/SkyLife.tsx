import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, MeshBasicMaterial } from 'three'
import { ss } from '../../lib/time'
import { frame, LAYER_FX } from '../frame'
import { glowMaterial } from '../materials'

/** Birds heading home at dusk, and a plane's lights crossing the night on its way in. */
export function SkyLife() {
  return (
    <>
      <Flock offset={0} y={14} size={7} />
      <Flock offset={23} y={10} size={4} />
      <Plane />
    </>
  )
}

const FLOCK_Z = -90
const FLOCK_SPAN = 140
const FLOCK_PERIOD = 46

function Flock({ offset, y, size }: { offset: number; y: number; size: number }) {
  const group = useRef<Group>(null)
  const wings = useRef<(Group | null)[]>([])
  const material = useMemo(() => new MeshBasicMaterial({ color: '#2A1530', transparent: true }), [])
  // V formation
  const birds = useMemo(
    () => Array.from({ length: size }, (_, i) => ({ dx: -Math.ceil(i / 2) * 1.6, dy: (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 0.7, ph: i * 0.9 })),
    [size],
  )

  useFrame(() => {
    const { tod, camX, time } = frame
    material.opacity = Math.min(1, 1 - ss(0.12, 0.3, tod.p) + tod.dawn)
    const t = ((time + offset) % FLOCK_PERIOD) / FLOCK_PERIOD
    if (group.current) {
      group.current.visible = material.opacity > 0.05
      group.current.position.set(camX * 0.7 - FLOCK_SPAN / 2 + t * FLOCK_SPAN, y + Math.sin(t * 9) * 0.6, FLOCK_Z)
    }
    wings.current.forEach((w, i) => w && (w.rotation.z = Math.sin(time * 7 + birds[i % birds.length].ph) * 0.5))
  })

  return (
    <group ref={group}>
      {birds.map((b, i) => (
        <group key={i} position={[b.dx, b.dy, 0]}>
          {[-1, 1].map((side, k) => (
            <group key={side} ref={(w) => (wings.current[i * 2 + k] = w)} scale-x={side}>
              <mesh material={material} position={[0.3, 0.1, 0]} rotation-z={0.35}>
                <boxGeometry args={[0.6, 0.12, 0.1]} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  )
}

const PLANE_Z = -260
const PLANE_PERIOD = 80

function Plane() {
  const group = useRef<Group>(null)
  const red = useRef<Mesh>(null)
  const white = useRef<Mesh>(null)
  const glow = useMemo(() => glowMaterial('#FF5A5A'), [])

  useFrame(() => {
    const { tod, camX, time } = frame
    const t = (time % PLANE_PERIOD) / PLANE_PERIOD
    const on = tod.lights > 0.4
    if (group.current) {
      group.current.visible = on
      group.current.position.set(camX - 130 + t * 260, 48 - t * 10, PLANE_Z)
    }
    const blink = time % 1.2 < 0.12
    if (red.current) red.current.visible = blink
    if (white.current) white.current.visible = (time + 0.6) % 1.2 < 0.1
    glow.opacity = blink ? 0.9 : 0
  })

  return (
    <group ref={group}>
      <mesh>
        <boxGeometry args={[1.2, 0.4, 0.4]} />
        <meshBasicMaterial color="#F7EAD7" />
      </mesh>
      <mesh ref={red} position={[-1.6, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#FF5A5A" />
      </mesh>
      <mesh ref={white} position={[1.6, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh material={glow} position={[-1.6, 0, 1]} layers={LAYER_FX}>
        <planeGeometry args={[7, 7]} />
      </mesh>
    </group>
  )
}

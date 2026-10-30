import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, MeshBasicMaterial } from 'three'
import { frame, LAYER_FX } from '../frame'
import { glowMaterial, toon } from '../materials'
import { SEA_Y } from '../Sea'

// Koli fishing boats riding at anchor: bright hulls, a little flag, a lantern at night.
const BOATS = [
  { x: -14, z: -34, hull: '#3E6FB0', trim: '#E7C55A', flag: '#E04848' },
  { x: 16, z: -52, hull: '#C0504A', trim: '#F7EAD7', flag: '#E7C55A' },
  { x: 42, z: -28, hull: '#3E8E85', trim: '#FFB067', flag: '#4A6FA5' },
  { x: 77, z: -46, hull: '#E7C55A', trim: '#3E6FB0', flag: '#E04848' },
  { x: 109, z: -31, hull: '#6B345F', trim: '#7FD1C7', flag: '#FFB067' },
  { x: 146, z: -58, hull: '#3E6FB0', trim: '#F7EAD7', flag: '#3E8E85' },
  { x: 181, z: -36, hull: '#C0504A', trim: '#E7C55A', flag: '#F7EAD7' },
  { x: 219, z: -49, hull: '#3E8E85', trim: '#FFB067', flag: '#E04848' },
]

export function Boats() {
  return (
    <>
      {BOATS.map((b, i) => (
        <Boat key={i} {...b} seed={i * 1.7} />
      ))}
    </>
  )
}

function Boat({ x, z, hull, trim, flag, seed }: (typeof BOATS)[number] & { seed: number }) {
  const g = useRef<Group>(null)
  const flagRef = useRef<Group>(null)
  const glow = useMemo(() => glowMaterial('#FFB067'), [])
  const lantern = useRef<MeshBasicMaterial>(null)

  useFrame(() => {
    const t = frame.time + seed
    if (g.current) {
      g.current.position.set(x + Math.sin(t * 0.05) * 1.5, SEA_Y + Math.sin(t * 1.1) * 0.06, z)
      g.current.rotation.z = Math.sin(t * 0.9) * 0.05
      g.current.rotation.x = Math.sin(t * 0.7 + 1) * 0.03
    }
    if (flagRef.current) flagRef.current.scale.x = 0.8 + Math.sin(t * 6) * 0.2
    const L = frame.tod.lights
    glow.opacity = L * (0.8 + Math.sin(t * 3.3) * 0.1)
    if (lantern.current) lantern.current.color.set(L > 0.2 ? '#FFE3A8' : '#3A3048')
  })

  return (
    <group ref={g}>
      {/* hull, painted trim, cabin, mast */}
      <mesh material={toon(hull)} position={[0, 0.12, 0]}>
        <boxGeometry args={[1.8, 0.3, 0.55]} />
      </mesh>
      <mesh material={toon(hull)} position={[0.98, 0.2, 0]} rotation-z={0.5}>
        <boxGeometry args={[0.35, 0.18, 0.5]} />
      </mesh>
      <mesh material={toon(trim)} position={[0, 0.26, 0.28]}>
        <boxGeometry args={[1.8, 0.05, 0.01]} />
      </mesh>
      <mesh material={toon('#5A4D6E')} position={[-0.35, 0.42, 0]}>
        <boxGeometry args={[0.5, 0.3, 0.42]} />
      </mesh>
      <mesh material={toon('#2A2238')} position={[0.25, 0.95, 0]}>
        <boxGeometry args={[0.04, 1.4, 0.04]} />
      </mesh>
      <group ref={flagRef} position={[0.27, 1.55, 0]}>
        <mesh material={toon(flag)} position={[0.12, 0, 0]}>
          <boxGeometry args={[0.24, 0.14, 0.01]} />
        </mesh>
      </group>
      {/* lantern on the cabin roof */}
      <mesh position={[-0.35, 0.62, 0.1]}>
        <boxGeometry args={[0.08, 0.1, 0.08]} />
        <meshBasicMaterial ref={lantern} color="#3A3048" />
      </mesh>
      <mesh material={glow} position={[-0.35, 0.62, 0.3]} layers={LAYER_FX}>
        <planeGeometry args={[1.4, 1.4]} />
      </mesh>
    </group>
  )
}

import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type Group, type MeshBasicMaterial } from 'three'
import { CharLayer } from '../characters/shared'
import { frame } from '../frame'
import { toon } from '../materials'
import { WALL_TOP } from '../Promenade'

// People on the wall, backs to us, watching the sea. Every few dozen metres, like the real thing.
const SPOTS = [
  { x: 17, a: '#C0504A', b: '#E7C55A', hairA: '#1A1020', hairB: '#2A1A20', lean: true, phone: false },
  { x: 41, a: '#3E6FB0', b: '#F7EAD7', hairA: '#1A1020', hairB: '#1A1020', lean: false, phone: true },
  { x: 59, a: '#6B345F', b: '#7FD1C7', hairA: '#2A1A20', hairB: '#1A1020', lean: true, phone: false },
  { x: 95, a: '#3E8E85', b: '#FFB067', hairA: '#1A1020', hairB: '#3A2420', lean: false, phone: false },
  { x: 124, a: '#E7C55A', b: '#4A6FA5', hairA: '#1A1020', hairB: '#1A1020', lean: true, phone: true },
  { x: 160, a: '#C0504A', b: '#C9B8D6', hairA: '#2A1A20', hairB: '#1A1020', lean: false, phone: false },
  { x: 188, a: '#4A6FA5', b: '#E04848', hairA: '#1A1020', hairB: '#2A1A20', lean: true, phone: false },
  { x: 215, a: '#F7EAD7', b: '#3E8E85', hairA: '#1A1020', hairB: '#1A1020', lean: false, phone: true },
]

export function Couples() {
  return (
    <>
      {SPOTS.map((s, i) => (
        <Couple key={i} {...s} seed={i * 1.9} />
      ))}
    </>
  )
}

function Couple({ x, a, b, hairA, hairB, lean, phone, seed }: (typeof SPOTS)[number] & { seed: number }) {
  const left = useRef<Group>(null)
  const right = useRef<Group>(null)
  const screen = useRef<MeshBasicMaterial>(null)
  const glow = useMemo(() => ({ off: new Color('#4A6E7A'), on: new Color('#B8F0FA') }), [])

  useFrame(() => {
    const t = frame.time + seed
    if (left.current) left.current.scale.y = 1 + Math.sin(t * 1.9) * 0.012
    if (right.current) {
      right.current.scale.y = 1 + Math.sin(t * 2.1 + 1) * 0.012
      // now and then one of them turns to say something
      right.current.children[1].rotation.y = Math.sin(t * 0.23) > 0.85 ? -0.6 : 0
    }
    if (screen.current) screen.current.color.copy(glow.off).lerp(glow.on, frame.tod.lights)
  })

  return (
    <CharLayer position={[x, WALL_TOP, -1.78]}>
      <Person groupRef={left} x={-0.17} shirt={a} hair={hairA} tilt={lean ? -0.22 : 0} />
      <Person groupRef={right} x={0.17} shirt={b} hair={hairB} tilt={0} />
      {phone && (
        <mesh position={[0.31, 0.5, 0.02]} rotation-z={0.2}>
          <boxGeometry args={[0.07, 0.11, 0.01]} />
          <meshBasicMaterial ref={screen} color="#9FE3F0" />
        </mesh>
      )}
    </CharLayer>
  )
}

function Person({
  groupRef,
  x,
  shirt,
  hair,
  tilt,
}: {
  groupRef: RefObject<Group | null>
  x: number
  shirt: string
  hair: string
  tilt: number
}) {
  return (
    <group ref={groupRef} position={[x, 0, 0]}>
      <mesh material={toon(shirt)} position={[0, 0.27, 0]} scale={[1.15, 1, 0.75]}>
        <capsuleGeometry args={[0.13, 0.2, 4, 10]} />
      </mesh>
      {/* head from behind: mostly hair, a sliver of neck */}
      <group position={[0, 0.6, 0]} rotation-z={tilt}>
        <mesh material={toon('#8A5A3C')} position={[0, -0.09, 0.01]}>
          <cylinderGeometry args={[0.04, 0.045, 0.06, 8]} />
        </mesh>
        <mesh material={toon(hair)} scale={[1, 1.05, 1]}>
          <sphereGeometry args={[0.12, 12, 8]} />
        </mesh>
      </group>
    </group>
  )
}

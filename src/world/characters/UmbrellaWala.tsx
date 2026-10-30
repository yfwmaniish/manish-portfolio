import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils, Vector3 } from 'three'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { useStore } from '../../store/useStore'
import { blocksCloseUp, frame } from '../frame'
import { toon } from '../materials'
import { useFace } from './faces'
import { CharLayer, HitBox } from './shared'

// Scene 3's easter egg: the umbrella seller, pacing in the monsoon with one umbrella
// open and a few more hooked on his arm. Stop him twice and he gives you one to keep.
const X0 = 58.8
const X1 = 62.5
const Z = 1.1
const SPEED = 0.7

// DRAFT lines.
const LINES = [
  'Chhatri? Fifty rupees. Monsoon price.',
  'Okay, okay. This one’s free. Don’t tell anyone.',
  'You already have one! Hold it properly.',
  'Same rain tomorrow. Same price.',
]
const HOOKED = ['#2A2238', '#4A6FA5', '#C0504A']

export function UmbrellaWala() {
  const root = useRef<Group>(null)
  const legs = useRef<(Group | null)[]>([])
  const face = useFace('Balloon wala')
  const s = useRef({ x: X0 + 1, dir: 1, stopped: 0, stride: 0, asks: 0 })
  const at = useMemo(() => new Vector3(), [])
  useAnchor('say-umbrella', () => at.set(s.current.x, 2.35, Z))

  const handlers = useInteractable({
    id: 'umbrella',
    label: 'Stop the umbrella seller',
    x: () => s.current.x,
    shown: () => frame.tod.rain > 0.15,
    onActivate: () => {
      const c = s.current
      c.stopped = 3
      useStore.getState().say('umbrella', LINES[Math.min(c.asks, LINES.length - 1)], 2600)
      c.asks++
      // from the second ask on, he gives in: the umbrella is yours, and it opens over you
      if (c.asks >= 2 && !useStore.getState().umbrellaOpen) useStore.getState().setUmbrella(true)
    },
  })

  useFrame((_, dt) => {
    const c = s.current
    const g = root.current
    if (!g) return
    // he's only out while it's raining
    g.visible = frame.tod.rain > 0.15 && !blocksCloseUp(c.x, Z)
    if (c.stopped > 0) {
      c.stopped -= dt
      g.rotation.y = MathUtils.damp(g.rotation.y, 0, 6, dt)
    } else {
      c.x += c.dir * SPEED * dt
      if (c.x > X1 || c.x < X0) c.dir *= -1
      c.stride += dt * 8
      g.rotation.y = MathUtils.damp(g.rotation.y, c.dir > 0 ? Math.PI / 2 : -Math.PI / 2, 6, dt)
    }
    const walking = c.stopped <= 0
    g.position.set(c.x, walking ? Math.abs(Math.sin(c.stride)) * 0.025 : 0, Z)
    legs.current.forEach((l, i) => l && (l.rotation.x = walking ? Math.sin(c.stride + i * Math.PI) * 0.45 : 0))
  })

  return (
    <group ref={root} position={[X0, 0, Z]}>
      <CharLayer>
        {[-0.07, 0.07].map((x, i) => (
          <group key={x} ref={(l) => (legs.current[i] = l)} position={[x, 0.78, 0]}>
            <mesh material={toon('#2A2440')} position={[0, -0.38, 0]}>
              <capsuleGeometry args={[0.055, 0.6, 4, 8]} />
            </mesh>
          </group>
        ))}
        <mesh material={toon('#7A8A6A')} position={[0, 1.08, 0]} scale={[1.1, 1, 0.75]}>
          <capsuleGeometry args={[0.15, 0.32, 4, 10]} />
        </mesh>
        <group position={[0, 1.52, 0]}>
          <mesh material={toon('#8A5A3C')}>
            <sphereGeometry args={[0.135, 12, 10]} />
          </mesh>
          <mesh material={face} position={[0, -0.01, 0.13]}>
            <planeGeometry args={[0.17, 0.149]} />
          </mesh>
          <mesh material={toon('#1A1020')} position={[0, 0.07, -0.02]} scale={[1, 0.6, 1]}>
            <sphereGeometry args={[0.14, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
        </group>
        {/* the open umbrella over him */}
        <mesh material={toon('#1A1424')} position={[0.05, 1.45, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.9, 4]} />
        </mesh>
        <mesh material={toon('#2A2238')} position={[0.05, 1.98, 0]} scale={[1, 0.45, 1]}>
          <sphereGeometry args={[0.55, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        {/* closed ones hooked on his arm */}
        {HOOKED.map((c, i) => (
          <mesh key={c} material={toon(c)} position={[0.2 + i * 0.05, 0.95, 0.08 - i * 0.05]} rotation-z={0.15}>
            <coneGeometry args={[0.04, 0.55, 5]} />
          </mesh>
        ))}
      </CharLayer>
      <HitBox size={[1.2, 2.3, 1.0]} position={[0, 1.15, 0]} {...handlers} />
    </group>
  )
}

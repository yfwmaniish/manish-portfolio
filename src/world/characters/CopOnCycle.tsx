import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils, Vector3 } from 'three'
import { useAnchor } from '../../engine/anchors'
import { emit } from '../../engine/events'
import { useInteractable } from '../../engine/interactables'
import { useStore } from '../../store/useStore'
import { blocksCloseUp, frame } from '../frame'
import { toon } from '../materials'
import { useFace } from './faces'
import { CharLayer, HitBox } from './shared'

// Scene 4's easter egg: a havaldar doing his midnight round on a bicycle, whistle at
// the ready. Stop him and he blows it — Ali, at the café table, jumps.
const X0 = 82.5
const X1 = 90.5
const Z = 1.8
const SPEED = 1.1
const KHAKI = '#B8A070'

// DRAFT lines, in order; the cat line only if the cat is following you.
const LINES = [
  'Phweeeet!',
  'Chalo, chalo. No sitting on the wall after midnight.',
  'Is that your dog? …No dogs on the wall either. …Fine. Good dog.',
  '…Fine. Five more minutes.',
  'Phweet. (He just likes the whistle.)',
]

export function CopOnCycle() {
  const root = useRef<Group>(null)
  const wheels = useRef<(Group | null)[]>([])
  const legs = useRef<(Group | null)[]>([])
  const face = useFace('Balloon wala')
  const s = useRef({ x: X0 + 2, dir: 1, stopped: 0, roll: 0, asks: 0 })
  const at = useMemo(() => new Vector3(), [])
  useAnchor('say-cop', () => at.set(s.current.x, 2.25, Z))

  const handlers = useInteractable({
    id: 'cop',
    label: 'Stop the cop on the bicycle',
    x: () => s.current.x,
    shown: () => frame.tod.rain < 0.2 && frame.tod.night > 0.7,
    onActivate: () => {
      const c = s.current
      c.stopped = 3
      const follows = !!useStore.getState().flags.cat_follows
      const lines = follows ? LINES : LINES.filter((_, i) => i !== 2)
      const line = lines[Math.min(c.asks, lines.length - 1)]
      useStore.getState().say('cop', line, 2600)
      if (line.startsWith('Phwe')) emit('whistle')
      c.asks++
    },
  })

  useFrame((_, dt) => {
    const c = s.current
    const g = root.current
    if (!g) return
    // only out once the rain has gone and it's properly night
    g.visible = frame.tod.rain < 0.2 && frame.tod.night > 0.7 && !blocksCloseUp(s.current.x, Z)
    if (c.stopped > 0) c.stopped -= dt
    else {
      c.x += c.dir * SPEED * dt
      if (c.x > X1 || c.x < X0) c.dir *= -1
      c.roll += (SPEED * dt) / 0.3
    }
    g.position.set(c.x, 0, Z)
    g.rotation.y = MathUtils.damp(g.rotation.y, c.dir > 0 ? 0 : Math.PI, 5, dt)
    wheels.current.forEach((w) => w && (w.rotation.z = -c.roll))
    legs.current.forEach((l, i) => l && (l.rotation.z = Math.sin(c.roll + i * Math.PI) * 0.5))
  })

  return (
    <group ref={root} position={[X0, 0, Z]}>
      <CharLayer>
        {/* bicycle: two wheels, a frame, handlebars, a lathi on the carrier */}
        {[-0.45, 0.45].map((x, i) => (
          <group key={x} ref={(w) => (wheels.current[i] = w)} position={[x, 0.32, 0]}>
            <mesh material={toon('#1A1424')}>
              <torusGeometry args={[0.3, 0.025, 4, 14]} />
            </mesh>
            <mesh material={toon('#5A5060')} rotation-z={Math.PI / 4}>
              <boxGeometry args={[0.56, 0.012, 0.012]} />
            </mesh>
          </group>
        ))}
        <mesh material={toon('#2A2238')} position={[0, 0.5, 0]} rotation-z={0.15}>
          <boxGeometry args={[0.9, 0.035, 0.035]} />
        </mesh>
        <mesh material={toon('#2A2238')} position={[0.35, 0.72, 0]}>
          <boxGeometry args={[0.035, 0.45, 0.035]} />
        </mesh>
        <mesh material={toon('#2A2238')} position={[0.36, 0.95, 0]}>
          <boxGeometry args={[0.035, 0.035, 0.42]} />
        </mesh>
        <mesh material={toon('#8A5A3C')} position={[-0.42, 0.72, 0.08]} rotation-z={1.45}>
          <cylinderGeometry args={[0.015, 0.015, 0.7, 5]} />
        </mesh>
        {/* the havaldar: khaki, a navy cap, a whistle on a cord */}
        {[-0.07, 0.07].map((zz, i) => (
          <group key={zz} ref={(l) => (legs.current[i] = l)} position={[-0.12, 0.88, zz]}>
            <mesh material={toon('#8A7A50')} position={[0.12, -0.22, 0]} rotation-z={0.7}>
              <capsuleGeometry args={[0.05, 0.36, 4, 8]} />
            </mesh>
          </group>
        ))}
        <mesh material={toon(KHAKI)} position={[-0.08, 1.15, 0]} rotation-z={-0.25} scale={[1, 1, 0.75]}>
          <capsuleGeometry args={[0.14, 0.28, 4, 10]} />
        </mesh>
        <mesh material={toon(KHAKI)} position={[0.17, 1.12, 0]} rotation-z={1.2}>
          <capsuleGeometry args={[0.04, 0.3, 4, 8]} />
        </mesh>
        <mesh material={toon('#C9B8D6')} position={[0.02, 1.27, 0.11]}>
          <boxGeometry args={[0.03, 0.02, 0.02]} />
        </mesh>
        <group position={[0.02, 1.55, 0]}>
          <mesh material={toon('#8A5A3C')}>
            <sphereGeometry args={[0.13, 12, 10]} />
          </mesh>
          <mesh material={face} position={[0.0, -0.01, 0.125]}>
            <planeGeometry args={[0.16, 0.14]} />
          </mesh>
          <mesh material={toon('#2A3050')} position={[0, 0.09, 0]} scale={[1, 0.45, 1]}>
            <cylinderGeometry args={[0.14, 0.13, 0.14, 12]} />
          </mesh>
          <mesh material={toon('#1A1C30')} position={[0.12, 0.065, 0]} scale={[1, 0.15, 1]}>
            <sphereGeometry args={[0.07, 8, 4]} />
          </mesh>
        </group>
      </CharLayer>
      <HitBox size={[1.4, 2.0, 0.9]} position={[0, 0.95, 0]} {...handlers} />
    </group>
  )
}

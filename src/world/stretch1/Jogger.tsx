import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils, Vector3 } from 'three'
import { sound } from '../../audio/bus'
import { JOG_FROM, JOG_TO } from '../../data/places'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { useStore } from '../../store/useStore'
import { useFace } from '../characters/faces'
import { CharLayer, HitBox } from '../characters/shared'
import { blocksCloseUp, frame } from '../frame'
import { toon } from '../materials'

// On the way to Scene 2: an uncle in a tracksuit doing his evening rounds, up and
// down the promenade, a little too proud of it. Stop him and he jogs on the spot
// while he talks, because stopping would ruin his streak.

const Z = 1.15
const SPEED = 1.5
// DRAFT lines, Ali to approve.
const LINES = ['Evening walk! Very good for the heart!', 'Round two! You should join!', 'Round three. Not tired. Not at all.', 'Doctor said ten thousand steps. I am at four hundred.']

export function Jogger() {
  const root = useRef<Group>(null)
  const legs = useRef<(Group | null)[]>([])
  const arms = useRef<(Group | null)[]>([])
  const face = useFace('Balloon wala')
  const s = useRef({ x: JOG_FROM + 6, dir: 1, stopped: 0, stride: 0, talks: 0, lastStep: 0 })
  const at = useMemo(() => new Vector3(), [])
  useAnchor('say-jogger', () => at.set(s.current.x, 2.05, Z))

  const handlers = useInteractable({
    id: 'jogger',
    label: 'Say hi to the jogging uncle',
    x: () => s.current.x,
    shown: () => frame.tod.night < 0.75,
    onActivate: () => {
      const c = s.current
      c.stopped = 2.8
      useStore.getState().say('jogger', LINES[c.talks++ % LINES.length], 2600)
    },
  })

  useFrame((_, dt) => {
    const c = s.current
    const g = root.current
    if (!g) return
    // he only jogs in the evening: gone by deep night
    g.visible = frame.tod.night < 0.75 && !blocksCloseUp(c.x, Z)
    if (!g.visible) return
    c.stride += dt * 9
    if (c.stopped > 0) {
      c.stopped -= dt
      g.rotation.y = MathUtils.damp(g.rotation.y, 0, 8, dt)
    } else {
      c.x += c.dir * SPEED * dt
      if (c.x > JOG_TO || c.x < JOG_FROM) c.dir *= -1
      g.rotation.y = MathUtils.damp(g.rotation.y, c.dir > 0 ? Math.PI / 2 : -Math.PI / 2, 8, dt)
    }
    g.position.set(c.x, Math.abs(Math.sin(c.stride)) * 0.05, Z)
    const swing = Math.sin(c.stride) * (c.stopped > 0 ? 0.35 : 0.7)
    legs.current.forEach((l, i) => l && (l.rotation.x = i ? swing : -swing))
    arms.current.forEach((a, i) => a && (a.rotation.x = i ? -swing : swing))
    // his trainers on the tiles, every half stride
    const step = Math.floor(c.stride / Math.PI)
    if (step !== c.lastStep) {
      c.lastStep = step
      if (Math.abs(c.x - frame.camX) < 10) sound('step', { x: c.x, rate: 1.15 })
    }
  })

  return (
    <group ref={root} position={[JOG_FROM + 6, 0, Z]}>
      <CharLayer>
        {[-0.08, 0.08].map((x, i) => (
          <group key={x} ref={(l) => (legs.current[i] = l)} position={[x, 0.8, 0]}>
            <mesh material={toon('#2A3A6E')} position={[0, -0.38, 0]}>
              <capsuleGeometry args={[0.06, 0.62, 4, 8]} />
            </mesh>
            <mesh material={toon('#F7EAD7')} position={[0, -0.76, 0.05]}>
              <boxGeometry args={[0.1, 0.07, 0.2]} />
            </mesh>
          </group>
        ))}
        {/* tracksuit top, white stripes, a comfortable belly */}
        <mesh material={toon('#2A3A6E')} position={[0, 1.1, 0.02]} scale={[1.25, 1, 1]}>
          <capsuleGeometry args={[0.19, 0.3, 4, 10]} />
        </mesh>
        {[-0.24, 0.24].map((x) => (
          <mesh key={x} material={toon('#F7EAD7')} position={[x, 1.1, 0.02]}>
            <boxGeometry args={[0.015, 0.4, 0.2]} />
          </mesh>
        ))}
        {[-0.27, 0.27].map((x, i) => (
          <group key={x} ref={(a) => (arms.current[i] = a)} position={[x, 1.32, 0]}>
            <mesh material={toon('#2A3A6E')} position={[0, -0.18, 0]} rotation-x={-0.6}>
              <capsuleGeometry args={[0.05, 0.26, 4, 6]} />
            </mesh>
          </group>
        ))}
        <group position={[0, 1.62, 0.02]}>
          <mesh material={toon('#8A5A3C')}>
            <sphereGeometry args={[0.15, 12, 10]} />
          </mesh>
          <mesh material={face} position={[0, -0.01, 0.146]}>
            <planeGeometry args={[0.19, 0.166]} />
          </mesh>
          {/* white hair at the sides, a red sweatband */}
          <mesh material={toon('#D8D2DC')} position={[0, 0.03, -0.03]} scale={[1.07, 0.8, 1.02]}>
            <sphereGeometry args={[0.15, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh material={toon('#E04848')} position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.158, 0.158, 0.045, 12]} />
          </mesh>
        </group>
      </CharLayer>
      <HitBox size={[0.55, 1.9, 0.5]} position={[0, 0.95, 0]} {...handlers} />
    </group>
  )
}

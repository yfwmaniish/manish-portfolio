import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { useStore } from '../../store/useStore'
import { CharLayer, HitBox } from '../characters/shared'
import { frame } from '../frame'
import { toon } from '../materials'
import { WALL_TOP } from '../Promenade'

const PERCHES = [6.5, 13, 21.5, 34, 47, 66, 88, 113, 140, 171, 199, 228]
// Walk this close and they take off.
const SPOOK_DISTANCE = 0.9
const COME_BACK_AFTER = 25

export function Crows() {
  return (
    <>
      {PERCHES.map((x, i) => (
        <Crow key={i} id={`crow-${i}`} x={x} seed={i * 2.3} />
      ))}
    </>
  )
}

type Mode = 'perched' | 'flying' | 'gone'

function Crow({ id, x, seed }: { id: string; x: number; seed: number }) {
  const root = useRef<Group>(null)
  const head = useRef<Group>(null)
  const wings = useRef<(Group | null)[]>([])
  const [mode, setMode] = useState<Mode>('perched')
  const s = useRef({ t: 0, hop: 0, peck: 0, fly: 0, dir: 1, away: 0 })

  const takeOff = (loud: boolean) => {
    if (mode !== 'perched') return
    s.current.fly = 0
    s.current.dir = Math.random() < 0.5 ? -1 : 1
    setMode('flying')
    if (loud) useStore.getState().say(id, 'caw!', 900)
  }

  const at = useRef(new Vector3())
  useAnchor(`say-${id}`, () => (root.current ? at.current.copy(root.current.position).setY(root.current.position.y + 0.45) : null))

  const handlers = useInteractable({
    id,
    label: 'Shoo the crow',
    x: () => x,
    enabled: mode === 'perched',
    onActivate: () => takeOff(true),
  })

  useFrame((_, dt) => {
    const c = s.current
    c.t += dt
    const g = root.current
    if (!g) return

    if (mode === 'perched') {
      if (Math.abs(frame.camX - x) < SPOOK_DISTANCE && frame.speed > 0.3) takeOff(false)
      // little hops and pecks, out of step with each other
      c.hop -= dt
      if (c.hop < -0.25) c.hop = 2 + ((seed * 7.1 + c.t) % 4)
      const hopY = c.hop < 0 ? Math.sin((-c.hop / 0.25) * Math.PI) * 0.06 : 0
      g.position.set(x, WALL_TOP + hopY, -1.7)
      c.peck -= dt
      if (c.peck < -0.4) c.peck = 1.5 + ((seed * 3.3 + c.t) % 3)
      if (head.current) {
        head.current.rotation.z = c.peck < 0 ? -0.8 : 0
        head.current.rotation.y = Math.sin(c.t * 0.8 + seed) > 0.6 ? 0.9 : 0
      }
      wings.current.forEach((w) => w && (w.rotation.x = 0))
    } else if (mode === 'flying') {
      c.fly += dt
      g.position.set(x + c.dir * c.fly * 1.8, WALL_TOP + c.fly * 1.6 + c.fly * c.fly * 0.4, -1.7 - c.fly * 2.2)
      g.rotation.y = c.dir > 0 ? 0 : Math.PI
      wings.current.forEach((w, i) => w && (w.rotation.x = Math.sin(c.fly * 28) * 1.1 * (i ? 1 : -1)))
      if (c.fly > 3) {
        c.away = 0
        setMode('gone')
      }
    } else {
      c.away += dt
      if (c.away > COME_BACK_AFTER && Math.abs(frame.camX - x) > 12) {
        g.rotation.y = 0
        setMode('perched')
      }
    }
  })

  return (
    <group ref={root} visible={mode !== 'gone'} position={[x, WALL_TOP, -1.7]}>
      <CharLayer>
        {/* body, tail, legs */}
        <mesh material={toon('#1A1424')} position={[0, 0.1, 0]} rotation-z={0.25}>
          <boxGeometry args={[0.16, 0.09, 0.08]} />
        </mesh>
        <mesh material={toon('#1A1424')} position={[0.1, 0.07, 0]} rotation-z={0.5}>
          <boxGeometry args={[0.1, 0.03, 0.06]} />
        </mesh>
        <mesh material={toon('#3A3048')} position={[-0.01, 0.03, 0]}>
          <boxGeometry args={[0.015, 0.06, 0.04]} />
        </mesh>
        {/* head: grey nape, beak, eye */}
        <group ref={head} position={[-0.08, 0.16, 0]}>
          <mesh material={toon('#1A1424')}>
            <boxGeometry args={[0.07, 0.065, 0.065]} />
          </mesh>
          <mesh material={toon('#4A4058')} position={[0.03, -0.01, 0]}>
            <boxGeometry args={[0.02, 0.05, 0.068]} />
          </mesh>
          <mesh material={toon('#2A2238')} position={[-0.05, -0.008, 0]}>
            <boxGeometry args={[0.04, 0.02, 0.025]} />
          </mesh>
        </group>
        {/* wings, folded unless flying */}
        {[-1, 1].map((side, i) => (
          <group key={side} ref={(w) => (wings.current[i] = w)} position={[0, 0.13, side * 0.04]}>
            <mesh material={toon('#241C30')} position={[0.01, 0, side * 0.05]}>
              <boxGeometry args={[0.14, 0.015, 0.1]} />
            </mesh>
          </group>
        ))}
      </CharLayer>
      {mode === 'perched' && <HitBox size={[0.4, 0.4, 0.4]} position={[0, 0.12, 0]} {...handlers} />}
    </group>
  )
}

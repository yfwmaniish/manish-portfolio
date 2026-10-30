import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils, Vector3 } from 'three'
import { useAnchor } from '../../engine/anchors'
import { on } from '../../engine/events'
import { useInteractable } from '../../engine/interactables'
import { startTalk } from '../../engine/story'
import { useStore } from '../../store/useStore'
import { frame } from '../frame'
import { toon } from '../materials'
import { TABLE_X, TABLE_Z } from '../scene4/Cafe'
import { Head, Legs, Torso } from './AliParts'
import { ChaiGlass } from './ChaiGlass'
import { useFace } from './faces'
import { CharLayer, HitBox } from './shared'

const Z = TABLE_Z - 0.48
const SEAT = 0.47

/**
 * Scene 4: Ali at the café table after the rain, writing in his notebook. The cop's
 * whistle makes him jump.
 */
export function AliCafe() {
  const body = useRef<Group>(null)
  const head = useRef<Group>(null)
  const forearms = useRef<(Group | null)[]>([])
  const face = useFace('Manish')
  const paid = useStore((s) => !!s.flags.chai_debt_paid)
  const jump = useRef(0)
  const markerAt = useMemo(() => new Vector3(TABLE_X, SEAT + 1.05, Z), [])
  const sayAt = useMemo(() => new Vector3(TABLE_X, SEAT + 1.0, Z), [])
  useAnchor('marker-ali4', () => markerAt)
  useAnchor('say-ali4', () => sayAt)

  useEffect(
    () =>
      on('whistle', () => {
        jump.current = 0.6
        useStore.getState().say('ali4', '!', 900)
      }),
    [],
  )

  const handlers = useInteractable({
    id: 'ali4',
    label: 'Talk to Manish',
    x: () => TABLE_X,
    onActivate: () => startTalk('ali4'),
  })

  useFrame((_, dt) => {
    const talking = useStore.getState().focus === 'ali4'
    const t = frame.time
    jump.current = Math.max(0, jump.current - dt)
    const j = jump.current > 0 ? Math.sin((jump.current / 0.6) * Math.PI) : 0
    if (body.current) body.current.position.y = SEAT + j * 0.06 + Math.sin(t * 1.7) * 0.004
    if (head.current) {
      const down = talking || j > 0 ? -0.05 : 0.42
      head.current.rotation.x = MathUtils.damp(head.current.rotation.x, down, 6, dt)
    }
    // writing: the right hand scribbles, the left holds the page
    forearms.current.forEach((f, i) => {
      if (!f) return
      const writing = !talking && i === 0
      f.rotation.x = -1.35 + (writing ? Math.sin(t * 7) * 0.05 : 0)
      f.rotation.z = writing ? Math.sin(t * 3.3) * 0.08 : 0
    })
  })

  return (
    <group>
      <group position={[TABLE_X, 0, Z]}>
        <CharLayer>
          <group ref={body} position={[0, SEAT, 0]}>
            <Legs />
            <Torso forearms={forearms} />
            <group ref={head} position={[0, 0.62, 0]}>
              <Head face={face} />
            </group>
          </group>
          {/* the open notebook and his pen */}
          <group position={[0, 0.745, 0.35]}>
            {[-1, 1].map((s) => (
              <mesh key={s} material={toon('#F2E6D4')} position={[s * 0.1, 0.01, 0]} rotation-z={s * -0.08}>
                <boxGeometry args={[0.19, 0.01, 0.25]} />
              </mesh>
            ))}
            <mesh material={toon('#6B345F')} position={[0, 0.002, 0]}>
              <boxGeometry args={[0.42, 0.006, 0.27]} />
            </mesh>
            <mesh material={toon('#1E1630')} position={[-0.09, 0.05, 0.02]} rotation={[0.3, 0, 0.6]}>
              <cylinderGeometry args={[0.006, 0.006, 0.13, 4]} />
            </mesh>
          </group>
        </CharLayer>
      </group>
      {/* his chai, and a second one, "prepaid", if you cleared his tab */}
      <ChaiGlass position={[TABLE_X - 0.2, 0.74, TABLE_Z + 0.05]} level={0.4} />
      {paid && <ChaiGlass position={[TABLE_X + 0.05, 0.74, TABLE_Z + 0.2]} level={0.9} />}
      <HitBox size={[0.8, 1.4, 1.1]} position={[TABLE_X, 0.85, TABLE_Z - 0.2]} {...handlers} />
    </group>
  )
}

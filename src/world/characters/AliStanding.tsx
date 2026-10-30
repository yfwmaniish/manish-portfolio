import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils, Vector3 } from 'three'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { startTalk } from '../../engine/story'
import { useStore, type Focus } from '../../store/useStore'
import { CAM_Z } from '../FrameDriver'
import { frame } from '../frame'
import { WALL_FRONT_Z } from '../Promenade'
import { toon } from '../materials'
import { Head, StandingLegs, Torso } from './AliParts'
import { useFace } from './faces'
import { CharLayer, HitBox, usePointerWorldX } from './shared'

export const ALI2_X = 28.4
const Z = WALL_FRONT_Z + 0.32
const HIP = 0.82

/**
 * Ali on his feet by the sea wall, hands in his hoodie pocket. Scene 2: under a
 * streetlight facing the promenade (the better look the prototype promises).
 * Scene 6: bag on, facing the sea, watching the sun come up; turns to you to talk.
 */
export function AliStanding({
  id = 'ali2',
  x = ALI2_X,
  faceSea = false,
  backpack = false,
}: {
  id?: Extract<Focus, 'ali2' | 'ali6'>
  x?: number
  faceSea?: boolean
  backpack?: boolean
}) {
  const body = useRef<Group>(null)
  const head = useRef<Group>(null)
  const forearms = useRef<(Group | null)[]>([])
  const face = useFace('Manish')
  const pointerX = usePointerWorldX()
  const yaw = useRef(0)
  const markerAt = useMemo(() => new Vector3(x, HIP + 1.0, Z), [x])
  useAnchor(`marker-${id}`, () => markerAt)
  const turn = useRef(faceSea ? Math.PI : 0)

  const handlers = useInteractable({
    id,
    label: 'Talk to Manish',
    x: () => x,
    onActivate: () => startTalk(id),
  })

  useFrame((_, dt) => {
    const talking = useStore.getState().focus === id
    const t = frame.time
    // looks your way while you move the cursor about; straight at you when talking
    const dx = pointerX(Z) - x
    const target = talking || faceSea ? 0 : MathUtils.clamp(Math.atan2(dx, CAM_Z - Z) * 1.3, -0.6, 0.6)
    yaw.current = MathUtils.damp(yaw.current, target, 4, dt)
    if (head.current) {
      head.current.rotation.y = yaw.current
      head.current.rotation.z = talking ? 0 : Math.sin(t * 0.5) * 0.05
    }
    // facing the sea, he turns round to face you when you talk
    turn.current = MathUtils.damp(turn.current, faceSea && !talking ? Math.PI : 0, 3, dt)
    if (body.current) {
      body.current.position.y = HIP + Math.sin(t * 1.8) * 0.005
      body.current.rotation.y = turn.current
    }
    // hands stay tucked in the hoodie pocket
    forearms.current.forEach((f) => f && (f.rotation.x = -1.15))
  })

  return (
    <group position={[x, 0, Z]}>
      <CharLayer>
        <group ref={body} position={[0, HIP, 0]} rotation-x={-0.06}>
          <StandingLegs />
          <Torso forearms={forearms} pose="pockets" />
          <group ref={head} position={[0, 0.62, 0]}>
            <Head face={face} />
          </group>
          {backpack && <Backpack />}
        </group>
      </CharLayer>
      <HitBox size={[0.7, 1.9, 0.6]} position={[0, 0.95, 0]} {...handlers} />
    </group>
  )
}

/** A laptop backpack, straps over the shoulders: going home. */
function Backpack() {
  return (
    <group position={[0, 0.34, -0.15]}>
      <mesh material={toon('#3E4A6E')} scale={[1, 1.15, 0.6]}>
        <capsuleGeometry args={[0.13, 0.12, 4, 10]} />
      </mesh>
      <mesh material={toon('#2E3858')} position={[0, -0.08, -0.07]} scale={[1, 0.7, 0.5]}>
        <capsuleGeometry args={[0.09, 0.04, 3, 8]} />
      </mesh>
      {[-0.11, 0.11].map((sx) => (
        <mesh key={sx} material={toon('#2E3858')} position={[sx, 0.1, 0.11]} rotation-x={0.25}>
          <boxGeometry args={[0.035, 0.3, 0.02]} />
        </mesh>
      ))}
    </group>
  )
}

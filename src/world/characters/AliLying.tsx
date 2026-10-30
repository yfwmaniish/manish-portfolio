import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Vector3 } from 'three'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { startTalk } from '../../engine/story'
import { useStore } from '../../store/useStore'
import { frame } from '../frame'
import { WALL_BACK_Z, WALL_FRONT_Z, WALL_TOP } from '../Promenade'
import { Head, StandingLegs, Torso } from './AliParts'
import { useFace } from './faces'
import { CharLayer, HitBox } from './shared'

export const ALI5_X = 112
const Z = (WALL_FRONT_Z + WALL_BACK_Z) / 2

/**
 * Scene 5: Ali flat on his back along the top of the sea wall, head toward the
 * chai-cart end, looking up at the stars. Built standing, then laid down: his front
 * faces the sky, his head points along -x.
 */
export function AliLying() {
  const chest = useRef<Group>(null)
  const head = useRef<Group>(null)
  const forearms = useRef<(Group | null)[]>([])
  const face = useFace('Manish')
  const markerAt = useMemo(() => new Vector3(ALI5_X - 0.5, WALL_TOP + 0.55, Z), [])
  useAnchor('marker-ali5', () => markerAt)

  const handlers = useInteractable({
    id: 'ali5',
    label: 'Talk to Manish',
    x: () => ALI5_X,
    onActivate: () => startTalk('ali5'),
  })

  useFrame(() => {
    const t = frame.time
    const talking = useStore.getState().focus === 'ali5'
    // slow breathing, and he turns his head toward you when you talk
    if (chest.current) chest.current.scale.z = 1 + Math.sin(t * 1.2) * 0.03
    if (head.current) head.current.rotation.y = talking ? -0.9 : Math.sin(t * 0.2) * 0.15
    forearms.current.forEach((f) => f && (f.rotation.x = -0.4))
  })

  return (
    <group position={[ALI5_X, WALL_TOP + 0.14, Z]}>
      <group rotation-y={Math.PI / 2}>
        <group rotation-x={-Math.PI / 2}>
          <CharLayer>
            <StandingLegs />
            <group ref={chest}>
              <Torso forearms={forearms} pose="pockets" />
            </group>
            <group ref={head} position={[0, 0.62, 0]}>
              <Head face={face} />
            </group>
          </CharLayer>
        </group>
      </group>
      <HitBox size={[1.9, 0.6, 0.8]} position={[0, 0.15, 0]} {...handlers} />
    </group>
  )
}

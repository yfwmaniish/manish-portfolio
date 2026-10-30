import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils, PointLight, Vector3 } from 'three'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { startTalk } from '../../engine/story'
import { useStore } from '../../store/useStore'
import { frame } from '../frame'
import { toon } from '../materials'
import { WALL_FRONT_Z } from '../Promenade'
import { STOP_X } from '../scene3/BusStop'
import { Head, Legs, Torso } from './AliParts'
import { useFace } from './faces'
import { CharLayer, HitBox } from './shared'

export const ALI3_X = STOP_X - 0.6
const Z = WALL_FRONT_Z + 0.42
const SEAT = 0.44

/** Scene 3: Ali on the bus-stop bench out of the rain, face lit by his phone's camera roll. */
export function AliBusStop() {
  const head = useRef<Group>(null)
  const forearms = useRef<(Group | null)[]>([])
  const glow = useRef<PointLight>(null)
  const face = useFace('Manish')
  const markerAt = useMemo(() => new Vector3(ALI3_X, SEAT + 1.05, Z), [])
  useAnchor('marker-ali3', () => markerAt)

  const handlers = useInteractable({
    id: 'ali3',
    label: 'Talk to Manish',
    x: () => ALI3_X,
    onActivate: () => startTalk('ali3'),
  })

  useFrame((_, dt) => {
    const talking = useStore.getState().focus === 'ali3'
    const t = frame.time
    if (head.current) {
      head.current.rotation.x = MathUtils.damp(head.current.rotation.x, talking ? 0 : 0.38, 4, dt)
      head.current.rotation.y = talking ? 0 : Math.sin(t * 0.3) * 0.06
    }
    // thumbs scrolling
    forearms.current.forEach((f, i) => f && (f.rotation.x = -1.25 + (i === 0 && !talking ? Math.sin(t * 6) * 0.04 : 0)))
    if (glow.current) glow.current.intensity = 0.12 + frame.tod.lights * 0.2
  })

  return (
    <group position={[ALI3_X, SEAT, Z]}>
      <CharLayer>
        <Legs />
        <Torso forearms={forearms} />
        <group ref={head} position={[0, 0.62, 0]}>
          <Head face={face} />
        </group>
        {/* phone held low, screen toward him */}
        <mesh material={toon('#1A1424')} position={[0, 0.22, 0.29]} rotation-x={-0.9}>
          <boxGeometry args={[0.07, 0.13, 0.012]} />
        </mesh>
        <mesh position={[0, 0.222, 0.282]} rotation-x={0.9 - Math.PI}>
          <planeGeometry args={[0.06, 0.11]} />
          <meshBasicMaterial color="#9FE3F0" />
        </mesh>
      </CharLayer>
      <pointLight
        ref={(l) => {
          glow.current = l
          l?.layers.enableAll()
        }}
        position={[0, 0.4, 0.3]}
        color="#9FE3F0"
        distance={0.7}
        decay={1.5}
      />
      <HitBox size={[0.7, 1.3, 0.8]} position={[0, 0.4, 0.15]} {...handlers} />
    </group>
  )
}

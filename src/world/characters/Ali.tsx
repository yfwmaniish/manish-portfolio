import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils, MeshBasicMaterial, PointLight, Vector3 } from 'three'
import { PROJECTS, SCREENS } from '../../data/projects'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { startTalk } from '../../engine/story'
import { useStore } from '../../store/useStore'
import { frame } from '../frame'
import { toon } from '../materials'
import { WALL_TOP } from '../Promenade'
import { makeLaptopScreen } from './laptopScreen'
import { ChaiGlass } from './ChaiGlass'
import { Head, Legs, Torso } from './AliParts'
import { useFace } from './faces'
import { CharLayer, HitBox } from './shared'

export const ALI_X = 0
const Z = -1.72

// Lid hinge angles: open and leaning back a touch, or tipped halfway shut.
const LID_OPEN = -2.88
const LID_HALF = -3.9

/**
 * Ali on the sea wall, back to the promenade, laptop glowing on his right knee.
 * Built facing +z and turned round to face the sea, so "his right" is world +x.
 * When you talk to him he stops typing, twists round and looks over his shoulder.
 */
export function Ali() {
  const torso = useRef<Group>(null)
  const head = useRef<Group>(null)
  const lid = useRef<Group>(null)
  const forearms = useRef<(Group | null)[]>([])
  const glow = useRef<PointLight>(null)
  const face = useFace('Manish')
  const screen = useMemo(makeLaptopScreen, [])
  const screenMat = useMemo(() => new MeshBasicMaterial({ map: screen.texture }), [screen])
  const anim = useRef({ key: 0, twist: 0, lid: LID_OPEN, showing: null as string | null })
  const markerAt = useMemo(() => new Vector3(ALI_X, WALL_TOP + 1.05, Z), [])
  useAnchor('marker-ali', () => markerAt)

  const handlers = useInteractable({
    id: 'ali',
    label: 'Talk to Manish',
    x: () => ALI_X,
    onActivate: () => startTalk('ali'),
  })

  useFrame((_, dt) => {
    const s = useStore.getState()
    const a = anim.current
    const t = frame.time
    const talking = s.focus === 'ali' || s.focus === 'laptop'
    const showing = s.focus === 'laptop' ? s.showing : null

    // keep typing unless someone's talking to him
    if (!talking) {
      a.key -= dt
      if (a.key <= 0) {
        a.key = 0.07 + Math.random() * 0.16 + (Math.random() < 0.06 ? 0.9 : 0)
        screen.type()
      }
    }
    if (showing !== a.showing) {
      a.showing = showing
      const p = showing
        ? (PROJECTS.find((x) => x.id === showing) ?? (showing === 'scan' || showing === 'about' ? SCREENS[showing] : null))
        : null
      screen.show(p ? { title: p.title, color: p.bg } : null)
    }

    // twist round to look back at you; face the screen again when showing it
    const twistTarget = talking && !showing ? 1 : 0
    a.twist = MathUtils.damp(a.twist, twistTarget, 5, dt)
    if (torso.current) {
      torso.current.rotation.y = a.twist * 0.55
      torso.current.position.y = Math.sin(t * 1.8) * 0.004
    }
    if (head.current) {
      head.current.rotation.y = a.twist * 1.45 + (talking ? 0 : Math.sin(t * 0.4) * 0.08)
      head.current.rotation.x = talking ? -0.05 : 0.32 // looks down at the screen while working
    }
    forearms.current.forEach((f, i) => {
      if (!f) return
      const typing = !talking && a.key < 0.12
      f.rotation.x = -1.25 + (typing ? Math.sin(t * 38 + i * 2) * 0.08 : 0)
    })

    // half-close the lid while he talks to you
    a.lid = MathUtils.damp(a.lid, talking && !showing ? LID_HALF : LID_OPEN, 6, dt)
    if (lid.current) lid.current.rotation.x = a.lid
    if (glow.current) glow.current.intensity = (0.25 + frame.tod.lights * 0.9) * (talking && !showing ? 0.4 : 1)
  })

  return (
    <group position={[ALI_X, WALL_TOP, Z]}>
      <group rotation-y={Math.PI}>
        <CharLayer>
          <Legs />
          <group ref={torso}>
            <Torso forearms={forearms} />
            <group ref={head} position={[0, 0.62, 0]}>
              <Head face={face} />
            </group>
          </group>

          {/* the laptop, on his right knee, angled toward him */}
          <group position={[-0.3, 0.16, 0.24]} rotation-y={0.45}>
            <mesh material={toon('#C9B8D6')}>
              <boxGeometry args={[0.36, 0.02, 0.24]} />
            </mesh>
            <group ref={lid} position={[0, 0.01, 0.12]} rotation-x={LID_OPEN}>
              <mesh material={toon('#C9B8D6')} position={[0, -0.12, -0.006]}>
                <boxGeometry args={[0.36, 0.24, 0.01]} />
              </mesh>
              <mesh material={screenMat} position={[0, -0.12, 0.001]}>
                <planeGeometry args={[0.33, 0.21]} />
              </mesh>
            </group>
            <pointLight
              ref={(l) => {
                glow.current = l
                l?.layers.enableAll()
              }}
              position={[0, 0.15, -0.1]}
              color="#7FD1C7"
              distance={1.4}
              decay={1.5}
            />
          </group>
        </CharLayer>
      </group>

      {/* his unfinished cutting chai, on the wall beside him */}
      <ChaiGlass position={[-0.38, 0, 0.05]} level={0.55} />

      <HitBox size={[0.9, 1.1, 0.7]} position={[0.1, 0.4, 0]} {...handlers} />
    </group>
  )
}

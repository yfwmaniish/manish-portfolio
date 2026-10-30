import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Vector3 } from 'three'
import { sound } from '../../audio/bus'
import { NEWS_X } from '../../data/places'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { useStore } from '../../store/useStore'
import { useFace } from '../characters/faces'
import { CharLayer, HitBox } from '../characters/shared'
import { frame } from '../frame'
import { toon } from '../materials'
import { PageSheet } from '../pages/PageSheet'

// On the way to Scene 6: before dawn, the newspaper man sorts tomorrow's papers
// off the back of his bicycle. Help him stack a bundle. The first time, there's a
// page in the pile that isn't newsprint: lined, with a red margin.

const Z = 0.8
const SHOWS_FROM = 0.8
// DRAFT lines, Ali to approve.
const FIRST = 'Thank you! Arre, this one is not newspaper. Somebody’s notebook page.'
const LINES = ['Tomorrow’s news, ready before the sun.', 'Every day, four in the morning. Even Sundays.', 'You want a job? It pays in chai.']

export function NewspaperMan() {
  const found = useStore((s) => s.pagesFound.includes('sealink'))
  const [slipped, setSlipped] = useState(false)
  const face = useFace('Balloon wala')
  const root = useRef<Group>(null)
  const arm = useRef<Group>(null)
  const s = useRef({ helps: 0, at: -10 })
  const [stack, setStack] = useState(3)
  const at = useMemo(() => new Vector3(NEWS_X, 1.95, Z), [])
  useAnchor('say-news', () => at)

  const here = () => frame.tod.p > SHOWS_FROM

  const handlers = useInteractable({
    id: 'news',
    label: 'Help with the newspapers',
    x: () => NEWS_X,
    shown: here,
    onActivate: () => {
      const c = s.current
      c.at = frame.time
      sound('thump', { x: NEWS_X })
      setStack((n) => Math.min(n + 1, 7))
      let line: string
      if (!found && !slipped) {
        setSlipped(true)
        line = FIRST
      } else line = LINES[c.helps % LINES.length]
      c.helps++
      useStore.getState().say('news', line, 2800)
    },
  })

  useFrame(() => {
    if (root.current) root.current.visible = here()
    // a swing of the arm as a bundle goes on the pile
    const since = frame.time - s.current.at
    if (arm.current) arm.current.rotation.x = since < 0.5 ? -1.4 * Math.sin((since / 0.5) * Math.PI) : -0.2
  })

  return (
    <group>
      <group ref={root} position={[NEWS_X, 0, Z]} visible={false}>
        <CharLayer>
          {/* the bicycle, side on, bundles on the carrier */}
          <group position={[0.9, 0, 0.1]}>
            {[-0.42, 0.42].map((x) => (
              <mesh key={x} material={toon('#1A1424')} position={[x, 0.32, 0]}>
                <torusGeometry args={[0.3, 0.025, 4, 14]} />
              </mesh>
            ))}
            <mesh material={toon('#3A3048')} position={[0, 0.5, 0]} rotation-z={0.25}>
              <boxGeometry args={[0.8, 0.04, 0.04]} />
            </mesh>
            <mesh material={toon('#E8E2D4')} position={[-0.38, 0.75, 0]}>
              <boxGeometry args={[0.36, 0.22, 0.3]} />
            </mesh>
          </group>
          {/* the stack on the ground, growing as you help */}
          {Array.from({ length: stack }, (_, i) => (
            <mesh key={i} material={toon(i % 2 ? '#E8E2D4' : '#D8D2C4')} position={[-0.55, 0.06 + i * 0.12, 0.05]} rotation-y={(i % 3) * 0.15}>
              <boxGeometry args={[0.36, 0.11, 0.28]} />
            </mesh>
          ))}
          {/* the newspaper man: shorts, a sweater against the dawn chill, a cap */}
          {[-0.07, 0.07].map((x) => (
            <mesh key={x} material={toon('#7A4E34')} position={[x, 0.4, 0]}>
              <capsuleGeometry args={[0.055, 0.62, 4, 8]} />
            </mesh>
          ))}
          <mesh material={toon('#4A6FA5')} position={[0, 0.62, 0]} scale={[1.15, 0.5, 0.8]}>
            <capsuleGeometry args={[0.15, 0.2, 4, 10]} />
          </mesh>
          <mesh material={toon('#6B345F')} position={[0, 1.05, 0]} scale={[1.15, 1, 0.75]}>
            <capsuleGeometry args={[0.16, 0.3, 4, 10]} />
          </mesh>
          <group ref={arm} position={[-0.2, 1.3, 0]}>
            <mesh material={toon('#6B345F')} position={[0, -0.18, 0]}>
              <capsuleGeometry args={[0.045, 0.28, 4, 6]} />
            </mesh>
          </group>
          <group position={[0, 1.52, 0.02]}>
            <mesh material={toon('#7A4E34')}>
              <sphereGeometry args={[0.14, 12, 10]} />
            </mesh>
            <mesh material={face} position={[0, -0.01, 0.136]}>
              <planeGeometry args={[0.18, 0.157]} />
            </mesh>
            <mesh material={toon('#E04848')} position={[0, 0.09, 0]} scale={[1, 0.5, 1]}>
              <sphereGeometry args={[0.145, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
          </group>
        </CharLayer>
        <HitBox size={[1.0, 1.9, 0.8]} position={[-0.2, 0.95, 0]} {...handlers} />
      </group>
      <PageSheet id="sealink" x={NEWS_X - 1.2} z={Z + 0.5} show={slipped || found} from={[NEWS_X - 0.55, 0.9, Z]} />
    </group>
  )
}

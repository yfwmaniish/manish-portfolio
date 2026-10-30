import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Vector3 } from 'three'
import { sound } from '../../audio/bus'
import { FISHER_X } from '../../data/places'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { useStore } from '../../store/useStore'
import { CharLayer, HitBox } from '../characters/shared'
import { frame } from '../frame'
import { toon } from '../materials'
import { PageSheet } from '../pages/PageSheet'
import { WALL_TOP } from '../Promenade'

// On the way to Scene 5: an old fisherman sitting on the sea wall past midnight,
// rod out over the tetrapods. Pull in his line and see what the sea gives back:
// a chappal, a bottle, nothing, and once, one of Ali's pages.

const Z = -1.75
const TIP: [number, number, number] = [0.25, 1.55, -1.2]
type Catch = 'chappal' | 'page' | 'bottle' | 'nothing'
// DRAFT lines, Ali to approve.
const LINES: Record<Catch, string> = {
  chappal: 'A chappal. Again. One day I will catch the other one.',
  page: 'Paper? Who throws paper in the sea? It has writing on it. Yours?',
  bottle: 'A bottle. The sea gives back what we give it.',
  nothing: 'Nothing. The fish are sleeping, like normal people.',
}

export function Fisherman() {
  const found = useStore((s) => s.pagesFound.includes('todo'))
  const [landed, setLanded] = useState(false)
  const rod = useRef<Group>(null)
  const items = useRef<Record<Catch, Group | null>>({ chappal: null, page: null, bottle: null, nothing: null })
  const s = useRef({ pulls: 0, at: -10, caught: 'nothing' as Catch })
  const at = useMemo(() => new Vector3(FISHER_X, WALL_TOP + 1.0, Z), [])
  useAnchor('say-fisher', () => at)

  const handlers = useInteractable({
    id: 'fisher',
    label: 'Pull in the fishing line',
    x: () => FISHER_X,
    onActivate: () => {
      const c = s.current
      if (frame.time - c.at < 2.5) return
      const order: Catch[] = found || landed ? ['chappal', 'bottle', 'nothing'] : ['chappal', 'page', 'bottle', 'nothing']
      c.caught = order[c.pulls++ % order.length]
      c.at = frame.time
      sound('reel', { x: FISHER_X })
      window.setTimeout(() => {
        useStore.getState().say('fisher', LINES[c.caught], 3000)
        if (c.caught === 'page') setLanded(true)
      }, 900)
    },
  })

  useFrame(() => {
    const c = s.current
    const since = frame.time - c.at
    const pulling = since < 2.6
    // the rod lifts as he reels in, then settles back
    if (rod.current) rod.current.rotation.x = -0.9 - (pulling ? Math.sin(Math.min(1, since / 0.9) * Math.PI * 0.5) * 0.45 : Math.sin(frame.time * 0.8) * 0.03)
    for (const k of Object.keys(items.current) as Catch[]) {
      const g = items.current[k]
      if (!g) continue
      g.visible = pulling && since > 0.8 && c.caught === k
      if (g.visible) g.rotation.z = Math.sin(frame.time * 5) * 0.4
    }
  })

  return (
    <group>
      <group position={[FISHER_X, WALL_TOP, Z]}>
        <CharLayer>
          {/* seen from behind: a vest, a towel round the neck, a cap */}
          <mesh material={toon('#F7EAD7')} position={[0, 0.27, 0]} scale={[1.2, 1, 0.8]}>
            <capsuleGeometry args={[0.14, 0.2, 4, 10]} />
          </mesh>
          <mesh material={toon('#C0504A')} position={[0, 0.5, 0]}>
            <torusGeometry args={[0.1, 0.035, 4, 10]} />
          </mesh>
          <group position={[0, 0.66, 0]}>
            <mesh material={toon('#7A4E34')}>
              <sphereGeometry args={[0.12, 12, 8]} />
            </mesh>
            <mesh material={toon('#3E6FB0')} position={[0, 0.06, 0]} scale={[1.05, 0.55, 1.05]}>
              <sphereGeometry args={[0.12, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
          </group>
          {/* the rod, out over the sea; the line drops to the water */}
          <group ref={rod} position={[0.15, 0.35, -0.05]} rotation-x={-0.9}>
            <mesh material={toon('#8A5A3C')} position={[0, 0.7, 0]}>
              <cylinderGeometry args={[0.008, 0.016, 1.4, 4]} />
            </mesh>
          </group>
          <mesh material={toon('#D8D2DC')} position={[TIP[0], TIP[1] / 2 - 0.1, TIP[2]]}>
            <cylinderGeometry args={[0.003, 0.003, TIP[1] + 0.8, 3]} />
          </mesh>
          {/* what comes up on the hook */}
          <group ref={(g) => (items.current.chappal = g)} position={[TIP[0], TIP[1] - 0.3, TIP[2]]} visible={false}>
            <mesh material={toon('#2A6E66')} scale={[0.5, 1, 0.15]}>
              <capsuleGeometry args={[0.06, 0.16, 3, 6]} />
            </mesh>
          </group>
          <group ref={(g) => (items.current.bottle = g)} position={[TIP[0], TIP[1] - 0.3, TIP[2]]} visible={false}>
            <mesh material={toon('#3E8E85')}>
              <cylinderGeometry args={[0.035, 0.035, 0.16, 6]} />
            </mesh>
          </group>
          <group ref={(g) => (items.current.page = g)} position={[TIP[0], TIP[1] - 0.3, TIP[2]]} visible={false}>
            <mesh material={toon('#FBF3E4')}>
              <boxGeometry args={[0.14, 0.18, 0.01]} />
            </mesh>
          </group>
        </CharLayer>
        <HitBox size={[0.7, 1.0, 0.6]} position={[0.05, 0.45, 0]} {...handlers} />
      </group>
      <PageSheet id="todo" x={FISHER_X + 0.8} z={-0.9} show={landed || found} from={[FISHER_X + TIP[0], WALL_TOP + TIP[1], Z + TIP[2]]} />
    </group>
  )
}

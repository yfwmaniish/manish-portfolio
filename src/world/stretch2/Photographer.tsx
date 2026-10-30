import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, Vector3 } from 'three'
import { sound } from '../../audio/bus'
import { PHOTOGRAPHER_X } from '../../data/places'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { useStore } from '../../store/useStore'
import { useFace } from '../characters/faces'
import { CharLayer, HitBox } from '../characters/shared'
import { frame, LAYER_FX } from '../frame'
import { glowMaterial, toon } from '../materials'
import { PageSheet } from '../pages/PageSheet'

// On the way to Scene 3: a street photographer with an old camera on a tripod, the
// kind who takes your picture by the sea for ten rupees. He takes yours, with a big
// flash. The first time, he hands over a paper someone dropped by his tripod.

const Z = 0.6
// DRAFT lines, Ali to approve.
const FIRST = 'Smile! …Also, somebody dropped this paper. Yours?'
const LINES = ['Ten rupees. Pay later. Like your friend with the laptop.', 'Again? Okay. Smile!', 'Beautiful. Very good face for the sea.']
const WITH_CAT = 'The dog also? Okay, two people. Tell it to smile.'

export function Photographer() {
  const found = useStore((s) => s.pagesFound.includes('chai-bill'))
  const [given, setGiven] = useState(false)
  const face = useFace('Balloon wala')
  const head = useRef<Group>(null)
  const flash = useRef<Mesh>(null)
  const glow = useMemo(() => glowMaterial('#FFF8EC'), [])
  const s = useRef({ talks: 0, flashAt: -10 })
  const at = useMemo(() => new Vector3(PHOTOGRAPHER_X, 2.0, Z), [])
  useAnchor('say-photographer', () => at)

  const handlers = useInteractable({
    id: 'photographer',
    label: 'Get your photo taken',
    x: () => PHOTOGRAPHER_X,
    onActivate: () => {
      const c = s.current
      c.flashAt = frame.time
      sound('shutter', { x: PHOTOGRAPHER_X })
      let line: string
      if (!given && !found) {
        setGiven(true)
        line = FIRST
      } else if (useStore.getState().flags.cat_follows && c.talks === 1) line = WITH_CAT
      else line = LINES[c.talks % LINES.length]
      c.talks++
      useStore.getState().say('photographer', line, 2800)
    },
  })

  useFrame(() => {
    const since = frame.time - s.current.flashAt
    glow.opacity = since < 0.25 ? 1 - since / 0.25 : 0
    if (flash.current) flash.current.visible = since < 0.25
    // he ducks behind the camera to take it, then looks up
    if (head.current) head.current.position.z = since < 0.8 ? -0.05 : 0.02
  })

  return (
    <group>
      <group position={[PHOTOGRAPHER_X, 0, Z]} rotation-y={0.5}>
        <CharLayer>
          {/* tripod and a boxy old camera */}
          {[-0.5, 0.5, Math.PI].map((a) => (
            <mesh key={a} material={toon('#2A2238')} position={[0.35 + Math.sin(a) * 0.12, 0.55, 0.35 + Math.cos(a) * 0.12]} rotation={[Math.cos(a) * 0.2, 0, -Math.sin(a) * 0.2]}>
              <cylinderGeometry args={[0.012, 0.012, 1.1, 4]} />
            </mesh>
          ))}
          <mesh material={toon('#1A1424')} position={[0.35, 1.15, 0.35]}>
            <boxGeometry args={[0.22, 0.15, 0.16]} />
          </mesh>
          <mesh material={toon('#5A4D6E')} position={[0.35, 1.15, 0.46]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.05, 0.05, 0.08, 8]} />
          </mesh>
          {/* the photographer: trousers, a checked shirt, a cloth bag */}
          {[-0.07, 0.07].map((x) => (
            <mesh key={x} material={toon('#3A3048')} position={[x, 0.4, 0]}>
              <capsuleGeometry args={[0.06, 0.62, 4, 8]} />
            </mesh>
          ))}
          <mesh material={toon('#3E8E85')} position={[0, 1.05, 0]} scale={[1.15, 1, 0.75]}>
            <capsuleGeometry args={[0.16, 0.3, 4, 10]} />
          </mesh>
          <mesh material={toon('#C9A46A')} position={[-0.24, 0.85, 0.02]}>
            <boxGeometry args={[0.1, 0.24, 0.2]} />
          </mesh>
          <mesh material={toon('#3E8E85')} position={[0.18, 1.18, 0.15]} rotation-x={-1.1}>
            <capsuleGeometry args={[0.045, 0.26, 4, 6]} />
          </mesh>
          <group ref={head} position={[0, 1.52, 0.02]}>
            <mesh material={toon('#7A4E34')}>
              <sphereGeometry args={[0.14, 12, 10]} />
            </mesh>
            <mesh material={face} position={[0, -0.01, 0.136]}>
              <planeGeometry args={[0.18, 0.157]} />
            </mesh>
            <mesh material={toon('#1A1020')} position={[0, 0.06, -0.01]} scale={[1.05, 0.65, 1.05]}>
              <sphereGeometry args={[0.14, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
          </group>
        </CharLayer>
        <mesh ref={flash} material={glow} position={[0.35, 1.2, 0.55]} layers={LAYER_FX} visible={false}>
          <planeGeometry args={[2.6, 2.6]} />
        </mesh>
        <HitBox size={[1.0, 1.9, 0.9]} position={[0.15, 0.95, 0.15]} {...handlers} />
      </group>
      <PageSheet id="chai-bill" x={PHOTOGRAPHER_X - 0.7} z={Z + 0.55} show={given || found} from={[PHOTOGRAPHER_X - 0.2, 1.3, Z + 0.3]} />
    </group>
  )
}

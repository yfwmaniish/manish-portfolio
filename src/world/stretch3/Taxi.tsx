import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Vector3 } from 'three'
import { sound } from '../../audio/bus'
import { TAXI_X } from '../../data/places'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { useStore } from '../../store/useStore'
import { CharLayer, HitBox } from '../characters/shared'
import { frame, LAYER_FX } from '../frame'
import { glowMaterial, toon } from '../materials'

// On the way to Scene 4: a black-and-yellow kaali-peeli taxi parked by the kerb,
// engine off, driver resting his arm on the window. Ask him for a ride and he
// turns down wherever you name, as Mumbai taxi drivers famously do.

const Z = 2.1
const BLACK = '#1A1424'
const YELLOW = '#E7C55A'
// DRAFT lines, Ali to approve.
const LINES = ['Colaba? Nahi jayega.', 'Bandra? Too far. Nahi jayega.', 'Churchgate? Too close. Nahi jayega.', 'Where am I going? Home. Nahi jayega.']

export function Taxi() {
  const lamps = useRef<Mesh>(null)
  const beams = useMemo(() => glowMaterial('#FFE3A8'), [])
  const s = useRef({ talks: 0 })
  const at = useMemo(() => new Vector3(TAXI_X - 0.1, 1.85, Z), [])
  useAnchor('say-taxi', () => at)

  const handlers = useInteractable({
    id: 'taxi',
    label: 'Ask the taxi for a ride',
    x: () => TAXI_X,
    onActivate: () => {
      sound('honk', { x: TAXI_X })
      useStore.getState().say('taxi', LINES[s.current.talks++ % LINES.length], 2600)
    },
  })

  useFrame(() => {
    // parking lights, dim, once the streetlights are on
    beams.opacity = frame.tod.lights * 0.45
    if (lamps.current) lamps.current.visible = frame.tod.lights > 0.2
  })

  return (
    <group position={[TAXI_X, 0, Z]}>
      <CharLayer>
        {/* the classic shape: a boxy black body, yellow roof, round headlamps */}
        <mesh material={toon(BLACK)} position={[0, 0.45, 0]}>
          <boxGeometry args={[2.1, 0.42, 0.9]} />
        </mesh>
        <mesh material={toon(YELLOW)} position={[-0.1, 0.86, 0]}>
          <boxGeometry args={[1.2, 0.4, 0.84]} />
        </mesh>
        <mesh material={toon('#2A3A6E')} position={[-0.1, 0.86, 0.425]}>
          <boxGeometry args={[1.05, 0.26, 0.01]} />
        </mesh>
        <mesh material={toon(YELLOW)} position={[-0.1, 1.1, 0]}>
          <boxGeometry args={[0.36, 0.1, 0.22]} />
        </mesh>
        {[-0.68, 0.68].map((x) => (
          <mesh key={x} material={toon('#0A0918')} position={[x, 0.2, 0.43]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.2, 0.2, 0.08, 10]} />
          </mesh>
        ))}
        <mesh material={toon('#F7EAD7')} position={[1.06, 0.5, 0.3]}>
          <boxGeometry args={[0.03, 0.1, 0.1]} />
        </mesh>
        {/* the driver: a head in the window and an elbow out */}
        <mesh material={toon('#7A4E34')} position={[0.2, 0.9, 0.2]}>
          <sphereGeometry args={[0.12, 10, 8]} />
        </mesh>
        <mesh material={toon('#1A1020')} position={[0.2, 0.96, 0.2]} scale={[1.05, 0.6, 1.05]}>
          <sphereGeometry args={[0.12, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh material={toon('#F7EAD7')} position={[0.32, 0.72, 0.46]} rotation-z={1.2}>
          <capsuleGeometry args={[0.05, 0.18, 4, 6]} />
        </mesh>
      </CharLayer>
      <mesh ref={lamps} material={beams} position={[1.2, 0.5, 0.3]} layers={LAYER_FX}>
        <planeGeometry args={[0.8, 0.5]} />
      </mesh>
      <HitBox size={[2.2, 1.3, 1.0]} position={[0, 0.6, 0]} {...handlers} />
    </group>
  )
}

import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, Group, MeshBasicMaterial, MeshToonMaterial, Vector3 } from 'three'
import { sound } from '../../audio/bus'
import { BOAT_FROM, BOAT_TO } from '../../data/places'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { ss } from '../../lib/time'
import { useStore } from '../../store/useStore'
import { CharLayer, HitBox } from '../characters/shared'
import { frame } from '../frame'
import { ramp } from '../materials'
import { PageSheet } from '../pages/PageSheet'

// On the way to Scene 4: after the rain, water runs along the kerb, and a little
// paper boat sails down it. Catch it and unfold it: it was folded from one of Ali's
// pages. (Once you have that page, it's just a boat.)

const Z = 1.47
const SPEED = 0.45
// DRAFT lines, Ali to approve.
const FOUND = 'It unfolds. Lined paper, with a red margin. Manish’s!'
const AGAIN = '(Just a paper boat this time. You let it go.)'

export function PaperBoat() {
  const found = useStore((s) => s.pagesFound.includes('certs'))
  const [caughtAt, setCaughtAt] = useState<number | null>(null)
  const boat = useRef<Group>(null)
  const water = useRef<Group>(null)
  const s = useRef({ x: BOAT_FROM, held: 0 })
  const paper = useMemo(() => new MeshToonMaterial({ color: '#FBF3E4', gradientMap: ramp, side: DoubleSide }), [])
  const stream = useMemo(() => new MeshBasicMaterial({ color: '#2A3A6E', transparent: true, depthWrite: false }), [])
  const at = useMemo(() => new Vector3(), [])
  useAnchor('say-boat', () => at.set(s.current.x, 0.75, Z))

  const wetNow = () => ss(0.33, 0.4, frame.tod.p) * (1 - ss(0.6, 0.66, frame.tod.p))

  const handlers = useInteractable({
    id: 'boat',
    label: 'Catch the paper boat',
    x: () => s.current.x,
    enabled: caughtAt === null,
    shown: () => wetNow() > 0.5,
    onActivate: () => {
      sound('paper', { x: s.current.x })
      if (found) {
        s.current.held = 1.5
        useStore.getState().say('boat', AGAIN, 2400)
        return
      }
      setCaughtAt(s.current.x)
      useStore.getState().say('boat', FOUND, 2800)
    },
  })

  useFrame((_, dt) => {
    const c = s.current
    const wet = wetNow()
    stream.opacity = wet * 0.55
    if (water.current) water.current.visible = wet > 0.05
    const g = boat.current
    if (!g) return
    g.visible = wet > 0.5 && caughtAt === null
    if (!g.visible) return
    c.held = Math.max(0, c.held - dt)
    if (c.held === 0) c.x += SPEED * dt
    if (c.x > BOAT_TO) c.x = BOAT_FROM
    const t = frame.time
    g.position.set(c.x, 0.03 + Math.sin(t * 3) * 0.008, Z)
    g.rotation.set(Math.sin(t * 2.3) * 0.08, Math.sin(t * 0.7) * 0.25, Math.sin(t * 1.9) * 0.06)
  })

  return (
    <>
      {/* the stream along the kerb */}
      <group ref={water} visible={false}>
        <mesh material={stream} position={[(BOAT_FROM + BOAT_TO) / 2, 0.012, Z]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[BOAT_TO - BOAT_FROM + 2, 0.2]} />
        </mesh>
      </group>
      <group ref={boat} visible={false}>
        <CharLayer>
          {/* hull: two slanted sides; sail: a folded peak */}
          {[-1, 1].map((side) => (
            <mesh key={side} material={paper} position={[0, 0.04, side * 0.03]} rotation-x={side * 0.5}>
              <boxGeometry args={[0.24, 0.07, 0.005]} />
            </mesh>
          ))}
          <mesh material={paper} position={[0, 0.11, 0]} rotation-y={Math.PI / 4}>
            <coneGeometry args={[0.07, 0.14, 4, 1, true]} />
          </mesh>
        </CharLayer>
        <HitBox size={[0.5, 0.4, 0.4]} position={[0, 0.12, 0]} {...handlers} />
      </group>
      {caughtAt !== null && <PageSheet id="certs" x={caughtAt + 0.1} z={Z - 0.35} show from={[caughtAt, 0.4, Z]} />}
    </>
  )
}

import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { sound } from '../../audio/bus'
import { JUMP_PUDDLE } from '../../data/places'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { ss } from '../../lib/time'
import { useStore } from '../../store/useStore'
import { CharLayer, HitBox } from '../characters/shared'
import { frame } from '../frame'
import { PageSheet } from '../pages/PageSheet'

// On the way to Scene 4: one of the puddles is just the right size for jumping in.
// Splash! The first time, the splash turns up a soggy page that was lying under the
// water: a page with a picture of Ali's cat.

const [X, Z] = JUMP_PUDDLE
const DROPS = 14
// DRAFT lines, Ali to approve.
const FIRST = '(Splash! Something papery was lying under the water.)'
const LINES = ['(Splash. Worth it.)', '(Splash. Your shoes are part of the sea now.)', '(SPLASH.)']

export function JumpPuddle() {
  const found = useStore((s) => s.pagesFound.includes('cat'))
  const [turnedUp, setTurnedUp] = useState(false)
  const root = useRef<Group>(null)
  const drops = useRef<(Mesh | null)[]>([])
  const water = useMemo(() => new MeshBasicMaterial({ color: '#9DB4D8' }), [])
  const s = useRef({ at: -10, jumps: 0, d: Array.from({ length: DROPS }, () => ({ vx: 0, vy: 0, vz: 0 })) })
  const at = useMemo(() => new Vector3(X, 0.9, Z), [])
  useAnchor('say-puddle', () => at)

  const wet = () => ss(0.33, 0.42, frame.tod.p) > 0.5

  const handlers = useInteractable({
    id: 'puddle',
    label: 'Jump in the puddle',
    x: () => X,
    shown: wet,
    onActivate: () => {
      const c = s.current
      c.at = frame.time
      c.d.forEach((d) => {
        const a = Math.random() * Math.PI * 2
        const r = 0.6 + Math.random() * 1.1
        Object.assign(d, { vx: Math.cos(a) * r, vy: 1.6 + Math.random() * 1.6, vz: Math.sin(a) * r * 0.5 })
      })
      sound('splash', { x: X, rate: 0.7 })
      sound('splash', { x: X, rate: 0.55 })
      let line: string
      if (!found && !turnedUp) {
        setTurnedUp(true)
        line = FIRST
      } else line = LINES[c.jumps % LINES.length]
      c.jumps++
      useStore.getState().say('puddle', line, 2600)
    },
  })

  useFrame(() => {
    if (root.current) root.current.visible = wet()
    const since = frame.time - s.current.at
    s.current.d.forEach((d, i) => {
      const m = drops.current[i]
      if (!m) return
      m.visible = since < 0.9
      if (!m.visible) return
      // thrown up and out, falling back under gravity
      m.position.set(d.vx * since, Math.max(0, d.vy * since - 4.9 * since * since), d.vz * since)
    })
  })

  return (
    <>
      <group ref={root} position={[X, 0.02, Z]}>
        <CharLayer>
          {Array.from({ length: DROPS }, (_, i) => (
            <mesh key={i} ref={(m) => (drops.current[i] = m)} material={water} visible={false}>
              <boxGeometry args={[0.035, 0.05, 0.035]} />
            </mesh>
          ))}
        </CharLayer>
        <HitBox size={[1.3, 0.35, 0.6]} position={[0, 0.15, 0]} {...handlers} />
      </group>
      <PageSheet id="cat" x={X + 0.95} z={Z + 0.45} show={turnedUp || found} from={[X, 0.9, Z]} />
    </>
  )
}

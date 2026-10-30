import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils, Vector3 } from 'three'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { useStore } from '../../store/useStore'
import { frame } from '../frame'
import { toon } from '../materials'
import { useFace } from './faces'
import { CharLayer, HitBox } from './shared'

// Scene 2's easter egg: the balloon wala. Click him and one balloon slips free and
// floats off over the sea, where it stays for the rest of the night.
export const BALLOON_X = 33.2
const Z = 0.5
const COLORS = ['#E04848', '#FFC56B', '#7FD1C7', '#F28FB3', '#4A6FA5', '#9ED9B0', '#FF8A4C']
// Where each balloon sits in the bunch, relative to the top of his stick.
const BUNCH: [number, number, number][] = [
  [0, 0.32, 0],
  [-0.16, 0.2, 0.05],
  [0.17, 0.22, -0.03],
  [-0.08, 0.06, -0.08],
  [0.1, 0.05, 0.09],
  [-0.22, 0.02, -0.04],
  [0.24, 0.04, 0.02],
]
const STICK_TOP = new Vector3(0.28, 1.9, 0)

// DRAFT lines, one per balloon you let go.
const LINES = ['Oye!', 'Arre — that one was red!', 'Ten rupees. Each.', 'They don’t come back, you know.', 'Okay. Take the sky.', 'That was my wife’s favourite colour.', '…I’m going home.']

const rise = (t: number) => Math.min(t * 0.55, 9) + Math.max(0, t - 16) * 0.05

export function BalloonWala() {
  const freed = useStore((s) => s.balloonsFreed)
  const free = useStore((s) => s.freeBalloon)
  const balloons = useRef<(Group | null)[]>([])
  const head = useRef<Group>(null)
  const face = useFace('Balloon wala')
  // when each balloon was let go (in world time); old saves start high in the sky
  const [launched] = useState(() => Array.from({ length: COLORS.length }, (_, i) => (i < freed ? -60 - i * 7 : Infinity)))
  const bubbleAt = useMemo(() => new Vector3(BALLOON_X, 2.0, Z), [])
  useAnchor('say-balloons', () => bubbleAt)

  const handlers = useInteractable({
    id: 'balloons',
    label: 'Let a balloon go',
    x: () => BALLOON_X,
    enabled: freed < COLORS.length,
    onActivate: () => {
      const n = useStore.getState().balloonsFreed
      if (n >= COLORS.length) return
      launched[n] = frame.time
      free()
      useStore.getState().say('balloons', LINES[n], 2000)
    },
  })

  useFrame(() => {
    const t = frame.time
    balloons.current.forEach((b, i) => {
      if (!b) return
      const [bx, by, bz] = BUNCH[i]
      const since = t - launched[i]
      if (since < 0 || !isFinite(since)) {
        // still on the stick, bobbing
        b.position.set(STICK_TOP.x + bx + Math.sin(t * 1.3 + i) * 0.02, STICK_TOP.y + by + Math.sin(t * 1.7 + i * 2) * 0.02, bz)
        b.rotation.z = Math.sin(t * 1.1 + i) * 0.08
      } else {
        // up and away over the sea, drifting with the breeze
        b.position.set(
          STICK_TOP.x + bx + since * 0.22 + Math.sin(since * 0.7 + i) * 0.3,
          STICK_TOP.y + by + rise(since),
          bz - Math.min(since * 0.5, 12),
        )
        b.rotation.z = Math.sin(since * 1.4 + i) * 0.15
      }
    })
    if (head.current) {
      // watches the last balloon go
      const watching = freed > 0 && t - launched[freed - 1] < 4
      head.current.rotation.x = MathUtils.damp(head.current.rotation.x, watching ? -0.45 : 0, 4, 1 / 60)
    }
  })

  return (
    <group position={[BALLOON_X, 0, Z]} rotation-y={-0.25}>
      <CharLayer>
        {/* legs, a striped shirt, a round head under a cap */}
        {[-0.07, 0.07].map((x) => (
          <mesh key={x} material={toon('#3A3048')} position={[x, 0.4, 0]}>
            <capsuleGeometry args={[0.06, 0.62, 4, 8]} />
          </mesh>
        ))}
        <mesh material={toon('#4A6FA5')} position={[0, 1.05, 0]} scale={[1.15, 1, 0.75]}>
          <capsuleGeometry args={[0.16, 0.3, 4, 10]} />
        </mesh>
        {[0.95, 1.08, 1.21].map((y) => (
          <mesh key={y} material={toon('#F7EAD7')} position={[0, y, 0]} scale={[1.17, 1, 0.77]}>
            <cylinderGeometry args={[0.162, 0.162, 0.025, 12]} />
          </mesh>
        ))}
        <group ref={head} position={[0, 1.52, 0]}>
          <mesh material={toon('#8A5A3C')}>
            <sphereGeometry args={[0.14, 12, 10]} />
          </mesh>
          <mesh material={face} position={[0, -0.01, 0.136]}>
            <planeGeometry args={[0.18, 0.157]} />
          </mesh>
          <mesh material={toon('#2A6E66')} position={[0, 0.09, 0]} scale={[1, 0.55, 1]}>
            <sphereGeometry args={[0.145, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh material={toon('#2A6E66')} position={[0, 0.085, 0.13]} scale={[1, 0.25, 0.6]}>
            <sphereGeometry args={[0.09, 8, 4]} />
          </mesh>
        </group>
        {/* arm up holding the stick */}
        <mesh material={toon('#4A6FA5')} position={[0.2, 1.3, 0]} rotation-z={-0.5}>
          <capsuleGeometry args={[0.045, 0.3, 4, 8]} />
        </mesh>
        <mesh material={toon('#5A3A2A')} position={[STICK_TOP.x, STICK_TOP.y / 2 + 0.55, 0]}>
          <cylinderGeometry args={[0.012, 0.012, STICK_TOP.y - 1.1, 6]} />
        </mesh>
        {/* the bunch */}
        {COLORS.map((c, i) => (
          <group key={c} ref={(g) => (balloons.current[i] = g)}>
            <mesh material={toon(c)} scale={[1, 1.18, 1]}>
              <sphereGeometry args={[0.1, 10, 8]} />
            </mesh>
            <mesh material={toon(c)} position={[0, -0.125, 0]} rotation-x={Math.PI}>
              <coneGeometry args={[0.02, 0.03, 5]} />
            </mesh>
            <mesh material={toon('#C9B8D6')} position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.003, 0.003, 0.18, 3]} />
            </mesh>
          </group>
        ))}
      </CharLayer>
      <HitBox size={[0.9, 2.6, 0.8]} position={[0.1, 1.3, 0]} {...handlers} />
    </group>
  )
}

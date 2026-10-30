import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Vector3 } from 'three'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { useStore } from '../../store/useStore'
import { frame } from '../frame'
import { toon } from '../materials'
import { useFace } from './faces'
import { CharLayer, HitBox } from './shared'
import { PageSheet } from '../pages/PageSheet'

// Scene 6's easter egg: the morning laughter club. Three uncles in a circle doing
// laughter yoga as the sun comes up — arms up, "HA HA HA". Join in and they get louder.
// The third time, one laughs so hard a folded paper falls out of his pocket: the
// secret last page, Ali's draft.
export const CLUB_X = 145.5
const Z = 1.0
const UNCLES = [
  { dx: -0.55, dz: 0.1, shirt: '#F2EDE4', pants: '#2A3050', hair: '#C9C2B8', turn: 0.9 },
  { dx: 0.0, dz: -0.35, shirt: '#E8E2D8', pants: '#3A3048', hair: '#8A8090', turn: 0 },
  { dx: 0.55, dz: 0.1, shirt: '#F7EAD7', pants: '#2A2440', hair: '#F7EAD7', turn: -0.9 },
]

// DRAFT lines, one per time you join in.
const LINES = ['HA HA HA!', 'Ho ho! Ha ha ha!', 'Join us! Laughing is free!', 'HAAA HA HA HA!', '(one of them is crying laughing. nobody knows why.)']

export function LaughterClub() {
  const people = useRef<(Group | null)[]>([])
  const arms = useRef<(Group | null)[]>([])
  const face = useFace('Balloon wala')
  const s = useRef({ joined: 0, burst: 0 })
  const draftFound = useStore((st) => st.pagesFound.includes('draft'))
  const [dropped, setDropped] = useState(false)
  const at = useMemo(() => new Vector3(CLUB_X, 2.15, Z), [])
  useAnchor('say-club', () => at)

  // they laugh on their own every so often while you're near
  useEffect(() => {
    const id = window.setInterval(() => {
      const st = useStore.getState()
      if (!st.speech.club && Math.abs(st.walkTarget - CLUB_X) < 9 && frame.tod.dawn > 0.3) st.say('club', 'ha… ha… ha…', 1800)
    }, 5200)
    return () => window.clearInterval(id)
  }, [])

  const handlers = useInteractable({
    id: 'club',
    label: 'Join the laughter club',
    x: () => CLUB_X,
    onActivate: () => {
      const c = s.current
      useStore.getState().say('club', LINES[Math.min(c.joined, LINES.length - 1)], 2400)
      c.joined++
      c.burst = 2.4
      if (c.joined === 3 && !draftFound) setDropped(true)
    },
  })

  useFrame((_, dt) => {
    const c = s.current
    const t = frame.time
    c.burst = Math.max(0, c.burst - dt)
    const big = c.burst > 0
    people.current.forEach((p, i) => {
      if (!p) return
      // bouncing with laughter, harder when you've joined in
      p.position.y = Math.abs(Math.sin(t * (big ? 9 : 4) + i)) * (big ? 0.06 : 0.02)
      p.rotation.x = big ? Math.sin(t * 9 + i) * 0.08 : 0
    })
    arms.current.forEach((a, i) => {
      if (!a) return
      // arms up to the sky, slowly; flung up when the laugh is big
      // left arms (even slots) swing out to -x, right arms to +x
      a.rotation.z = (i % 2 ? 1 : -1) * (big ? 2.6 : 1.6 + Math.sin(t * 1.2) * 0.9)
    })
  })

  return (
    <>
      <group position={[CLUB_X, 0, Z]}>
        <CharLayer>
          {UNCLES.map((u, i) => (
            <group key={i} ref={(g) => (people.current[i] = g)} position={[u.dx, 0, u.dz]} rotation-y={u.turn}>
              {[-0.07, 0.07].map((x) => (
                <mesh key={x} material={toon(u.pants)} position={[x, 0.4, 0]}>
                  <capsuleGeometry args={[0.06, 0.6, 4, 8]} />
                </mesh>
              ))}
              <mesh material={toon(u.shirt)} position={[0, 1.04, 0]} scale={[1.15, 1, 0.8]}>
                <capsuleGeometry args={[0.16, 0.3, 4, 10]} />
              </mesh>
              {[-1, 1].map((side, k) => (
                <group key={side} ref={(a) => (arms.current[i * 2 + k] = a)} position={[side * 0.2, 1.3, 0]}>
                  <mesh material={toon(u.shirt)} position={[0, -0.17, 0]}>
                    <capsuleGeometry args={[0.045, 0.28, 4, 8]} />
                  </mesh>
                  <mesh material={toon('#8A5A3C')} position={[0, -0.36, 0]}>
                    <sphereGeometry args={[0.04, 6, 4]} />
                  </mesh>
                </group>
              ))}
              <group position={[0, 1.52, 0]}>
                <mesh material={toon('#8A5A3C')}>
                  <sphereGeometry args={[0.135, 12, 10]} />
                </mesh>
                <mesh material={face} position={[0, -0.01, 0.13]}>
                  <planeGeometry args={[0.17, 0.149]} />
                </mesh>
                <mesh material={toon(u.hair)} position={[0, 0.05, -0.03]} scale={[1.02, 0.8, 1]}>
                  <sphereGeometry args={[0.135, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
                </mesh>
              </group>
            </group>
          ))}
        </CharLayer>
        <HitBox size={[1.8, 2.1, 1.2]} position={[0, 1.05, 0]} {...handlers} />
      </group>
      <PageSheet id="draft" x={CLUB_X + 0.9} z={Z + 0.6} show={dropped} from={[CLUB_X + 0.55, 1.2, Z + 0.1]} />
    </>
  )
}

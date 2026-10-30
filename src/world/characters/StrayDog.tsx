import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils, Vector3 } from 'three'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { useStore } from '../../store/useStore'
import { frame } from '../frame'
import { toon } from '../materials'
import { CharLayer, HitBox } from './shared'

// Scene 5's easter egg: a stray asleep on the promenade at 2 AM, curled nose to tail.
// Bother it and it wakes a little more each time, until it rolls over for a belly rub.
export const DOG_X = 116.2
const Z = 0.9
const FUR = '#B8865A'
const FUR_DARK = '#8A5E3C'

// DRAFT stage directions, one per poke.
const STAGES = [
  '(one ear twitches)',
  '(thump, thump — the tail)',
  '(rolls over. this is a belly-rub request.)',
  '(asleep again before you stand up)',
]

type Pose = 'curled' | 'head-up' | 'belly'

export function StrayDog() {
  const root = useRef<Group>(null)
  const head = useRef<Group>(null)
  const ear = useRef<Group>(null)
  const tail = useRef<Group>(null)
  const s = useRef({ pokes: 0, pose: 'curled' as Pose, until: 0, thump: 0 })
  const at = useMemo(() => new Vector3(DOG_X, 0.75, Z), [])
  useAnchor('say-dog', () => at)

  // little "z z z" over its head every so often while it sleeps
  useEffect(() => {
    const id = window.setInterval(() => {
      const st = useStore.getState()
      if (s.current.pose === 'curled' && !st.speech.dog && Math.abs(st.walkTarget - DOG_X) < 9) st.say('dog', 'z z z', 1600)
    }, 4200)
    return () => window.clearInterval(id)
  }, [])

  const handlers = useInteractable({
    id: 'dog',
    label: 'Pat the sleeping dog',
    x: () => DOG_X,
    onActivate: () => {
      const c = s.current
      const stage = c.pokes % STAGES.length
      c.pokes++
      useStore.getState().say('dog', STAGES[stage], 2400)
      c.pose = stage === 0 || stage === 1 ? 'head-up' : stage === 2 ? 'belly' : 'curled'
      c.thump = stage === 1 ? 1.4 : 0
      c.until = frame.time + 6
      // the indie, if it's with you, wants in on the belly rubs
      if (useStore.getState().flags.cat_follows && stage === 2) window.setTimeout(() => useStore.getState().say('cat', '(sniff sniff. friends now.)', 1600), 600)
    },
  })

  useFrame((_, dt) => {
    const c = s.current
    const t = frame.time
    if (c.pose !== 'curled' && t > c.until) c.pose = 'curled'
    c.thump = Math.max(0, c.thump - dt)
    if (root.current) {
      root.current.rotation.z = MathUtils.damp(root.current.rotation.z, c.pose === 'belly' ? Math.PI * 0.85 : 0, 5, dt)
      root.current.position.y = c.pose === 'belly' ? 0.2 : 0
      root.current.scale.y = 1 + (c.pose === 'curled' ? Math.sin(t * 1.4) * 0.04 : 0)
    }
    if (head.current) head.current.rotation.z = MathUtils.damp(head.current.rotation.z, c.pose === 'head-up' ? 0.7 : 0, 6, dt)
    if (ear.current) ear.current.rotation.x = c.pose === 'head-up' && Math.sin(t * 9) > 0.6 ? 0.5 : 0
    if (tail.current) tail.current.rotation.y = c.thump > 0 ? Math.sin(t * 14) * 0.6 : Math.sin(t * 0.8) * 0.05
  })

  return (
    <group position={[DOG_X, 0, Z]}>
      <group ref={root}>
        <CharLayer>
          {/* curled body: a fat crescent of two lumps */}
          <mesh material={toon(FUR)} position={[0, 0.13, 0]} scale={[1.6, 0.85, 1.1]}>
            <sphereGeometry args={[0.15, 12, 8]} />
          </mesh>
          <mesh material={toon(FUR_DARK)} position={[0.12, 0.14, -0.05]} scale={[1, 0.8, 1]}>
            <sphereGeometry args={[0.12, 10, 8]} />
          </mesh>
          <mesh material={toon('#E8D4B0')} position={[-0.06, 0.08, 0.13]} scale={[1.2, 0.6, 0.5]}>
            <sphereGeometry args={[0.08, 8, 6]} />
          </mesh>
          {/* head resting on its paws, pointed snout, one floppy ear */}
          <group ref={head} position={[-0.2, 0.1, 0.08]}>
            <mesh material={toon(FUR)} position={[-0.05, 0.03, 0]}>
              <sphereGeometry args={[0.085, 10, 8]} />
            </mesh>
            <mesh material={toon(FUR)} position={[-0.14, 0.0, 0.02]} rotation-z={Math.PI / 2}>
              <coneGeometry args={[0.045, 0.1, 6]} />
            </mesh>
            <mesh material={toon('#1A1020')} position={[-0.19, 0.005, 0.02]}>
              <sphereGeometry args={[0.014, 6, 4]} />
            </mesh>
            <mesh material={toon('#1A1020')} position={[-0.09, 0.05, 0.075]}>
              <boxGeometry args={[0.02, 0.006, 0.006]} />
            </mesh>
            <group ref={ear} position={[-0.02, 0.1, 0.03]}>
              <mesh material={toon(FUR_DARK)} position={[0, 0.03, 0]} rotation-z={0.3}>
                <coneGeometry args={[0.03, 0.07, 4]} />
              </mesh>
            </group>
          </group>
          {/* front paws and the tail curled round */}
          {[0.03, 0.09].map((zz) => (
            <mesh key={zz} material={toon('#E8D4B0')} position={[-0.25, 0.03, zz]} rotation-z={Math.PI / 2}>
              <capsuleGeometry args={[0.022, 0.08, 3, 6]} />
            </mesh>
          ))}
          <group ref={tail} position={[0.25, 0.07, 0.05]}>
            <mesh material={toon(FUR_DARK)} position={[-0.05, 0, 0.08]} rotation={[Math.PI / 2, 0, 0.6]}>
              <capsuleGeometry args={[0.025, 0.16, 3, 6]} />
            </mesh>
          </group>
        </CharLayer>
      </group>
      <HitBox size={[0.8, 0.6, 0.6]} position={[0, 0.2, 0]} {...handlers} />
    </group>
  )
}

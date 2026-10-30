import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MeshBasicMaterial, Vector3 } from 'three'
import { sound } from '../../audio/bus'

// How long their song lasts (matches SONG_SECONDS in audio/sfx.ts).
const SONG_SECONDS = 11
import { OLD_COUPLE_X } from '../../data/places'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { useStore } from '../../store/useStore'
import { CharLayer, HitBox } from '../characters/shared'
import { frame } from '../frame'
import { toon } from '../materials'
import { WALL_TOP } from '../Promenade'

// On the way to Scene 3: an old couple on the sea wall, sharing one pair of
// earphones, the wire making a V between them. Lean in and you hear their song,
// tinny and far away, and little notes drift up.

const Z = -1.78
const NOTES = 5
// DRAFT lines, Ali to approve.
const LINES = ['Our song. We heard it here first, long ago.', 'He still sings it wrong. Every time.', 'Shh. This is the good part.']

export function OldCouple() {
  const him = useRef<Group>(null)
  const her = useRef<Group>(null)
  const notes = useRef<(Group | null)[]>([])
  const s = useRef({ talks: 0, playing: -10 })
  const ink = useMemo(() => new MeshBasicMaterial({ color: '#FFE3A8' }), [])
  const at = useMemo(() => new Vector3(OLD_COUPLE_X, WALL_TOP + 1.0, Z), [])
  useAnchor('say-couple', () => at)

  const handlers = useInteractable({
    id: 'old-couple',
    label: 'Listen in',
    x: () => OLD_COUPLE_X,
    onActivate: () => {
      const c = s.current
      if (frame.time - c.playing < SONG_SECONDS) return
      c.playing = frame.time
      sound('song', { x: OLD_COUPLE_X })
      useStore.getState().say('couple', LINES[c.talks++ % LINES.length], 3000)
    },
  })

  useFrame(() => {
    const c = s.current
    const t = frame.time
    const since = t - c.playing
    const listening = since < SONG_SECONDS
    // they sway together while the song plays, and lean in a little anyway
    const sway = listening ? Math.sin(t * 2.4) * 0.06 : 0
    if (him.current) him.current.rotation.z = -0.12 + sway
    if (her.current) her.current.rotation.z = 0.16 + sway
    notes.current.forEach((n, i) => {
      if (!n) return
      const life = (since - i * 0.8) / 2.2
      n.visible = listening && life > 0 && life < 1
      if (n.visible) n.position.set(Math.sin(life * 6 + i) * 0.15 + (i % 2 ? 0.1 : -0.1), 0.8 + life * 0.7, 0.05)
    })
  })

  return (
    <group position={[OLD_COUPLE_X, WALL_TOP, Z]}>
      <CharLayer>
        {[
          { ref: him, x: -0.17, shirt: '#8A9AB8', hair: '#D8D2DC', bald: true },
          { ref: her, x: 0.17, shirt: '#C0504A', hair: '#E8E2EA', bald: false },
        ].map((p) => (
          <group key={p.x} ref={p.ref} position={[p.x, 0, 0]}>
            <mesh material={toon(p.shirt)} position={[0, 0.27, 0]} scale={[1.15, 1, 0.75]}>
              <capsuleGeometry args={[0.13, 0.2, 4, 10]} />
            </mesh>
            <group position={[0, 0.6, 0]}>
              <mesh material={toon('#8A5A3C')} position={[0, -0.09, 0.01]}>
                <cylinderGeometry args={[0.04, 0.045, 0.06, 8]} />
              </mesh>
              {/* white hair: a ring round a bald head for him, a bun for her */}
              <mesh material={toon(p.bald ? '#8A5A3C' : p.hair)}>
                <sphereGeometry args={[0.12, 12, 8]} />
              </mesh>
              {p.bald ? (
                <mesh material={toon(p.hair)} position={[0, -0.03, 0]}>
                  <torusGeometry args={[0.112, 0.03, 4, 12]} />
                </mesh>
              ) : (
                <mesh material={toon(p.hair)} position={[0, 0.04, -0.12]}>
                  <sphereGeometry args={[0.06, 8, 6]} />
                </mesh>
              )}
            </group>
          </group>
        ))}
        {/* the earphone wire: one bud each, joined below */}
        <mesh material={toon('#F7EAD7')} position={[-0.08, 0.5, 0.06]} rotation-z={-0.75}>
          <cylinderGeometry args={[0.006, 0.006, 0.26, 3]} />
        </mesh>
        <mesh material={toon('#F7EAD7')} position={[0.08, 0.5, 0.06]} rotation-z={0.75}>
          <cylinderGeometry args={[0.006, 0.006, 0.26, 3]} />
        </mesh>
        <mesh material={toon('#F7EAD7')} position={[0, 0.3, 0.07]}>
          <cylinderGeometry args={[0.006, 0.006, 0.22, 3]} />
        </mesh>
        {Array.from({ length: NOTES }, (_, i) => (
          <group key={i} ref={(n) => (notes.current[i] = n)} visible={false}>
            <mesh material={ink} position={[0, 0, 0]}>
              <boxGeometry args={[0.05, 0.04, 0.01]} />
            </mesh>
            <mesh material={ink} position={[0.02, 0.06, 0]}>
              <boxGeometry args={[0.012, 0.12, 0.01]} />
            </mesh>
          </group>
        ))}
      </CharLayer>
      <HitBox size={[0.8, 0.9, 0.5]} position={[0, 0.45, 0]} {...handlers} />
    </group>
  )
}

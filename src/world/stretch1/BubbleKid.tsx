import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { sound } from '../../audio/bus'
import { KID_X } from '../../data/places'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { useStore } from '../../store/useStore'
import { useFace } from '../characters/faces'
import { CharLayer, HitBox } from '../characters/shared'
import { frame } from '../frame'
import { toon } from '../materials'
import { PageSheet } from '../pages/PageSheet'

// On the way to Scene 2: a kid blowing soap bubbles off the sea wall. Click to pop
// every bubble in the air. Do it enough and the kid blows one giant bubble with
// something folded inside it: one of Ali's pages.

const Z = 0.2
const WAND: [number, number] = [0.22, 0.95]
const COUNT = 9
const BIG = 0.32
// DRAFT lines, Ali to approve.
const LINES = ['Pop them all! Bet you can’t!', 'Again! Again!', 'Ammi says I have to go home at nine.']
const GIANT = 'Watch this one. It’s HUGE.'
const DROPPED = 'There was paper inside that one!'

interface Bubble { t: number; life: number; r: number; dx: number; dz: number; seed: number; big: boolean }

export function BubbleKid() {
  const found = useStore((s) => s.pagesFound.includes('train'))
  const [dropped, setDropped] = useState(false)
  const face = useFace('Balloon wala')
  const body = useRef<Group>(null)
  const meshes = useRef<(Mesh | null)[]>([])
  const paper = useRef<Mesh>(null)
  const film = useMemo(() => new MeshBasicMaterial({ color: '#CFEFFF', transparent: true, opacity: 0.38, depthWrite: false }), [])
  const shine = useMemo(() => new MeshBasicMaterial({ color: '#FFFFFF' }), [])
  const s = useRef({ next: 0.5, jump: 0, clicks: 0, bubbles: [] as Bubble[], bigAt: new Vector3() })
  const at = useMemo(() => new Vector3(KID_X, 1.35, Z), [])
  useAnchor('say-kid', () => at)

  const blow = (big = false) => {
    const c = s.current
    const free = c.bubbles.length < COUNT ? c.bubbles.length : c.bubbles.findIndex((b) => b.t > b.life)
    if (free < 0) return
    c.bubbles[free] = { t: 0, life: big ? 3.2 : 3 + Math.random() * 3, r: big ? BIG : 0.04 + Math.random() * 0.07, dx: 0.25 + Math.random() * 0.3, dz: (Math.random() - 0.5) * 0.3, seed: Math.random() * 9, big }
  }

  const handlers = useInteractable({
    id: 'kid',
    label: 'Pop the bubbles',
    x: () => KID_X,
    onActivate: () => {
      const c = s.current
      let n = 0
      c.bubbles.forEach((b) => {
        if (b.t < b.life && !b.big) {
          b.life = b.t
          window.setTimeout(() => sound('pop', { x: KID_X, rate: 0.8 + Math.random() * 0.5 }), n++ * 70)
        }
      })
      c.jump = 0.5
      c.clicks++
      // the third time, the giant bubble with the page inside
      const giant = c.clicks === 3 && !found && !dropped
      if (giant) blow(true)
      useStore.getState().say('kid', giant ? GIANT : LINES[(c.clicks - 1) % LINES.length], 2200)
    },
  })

  useFrame((_, dt) => {
    const c = s.current
    const t = frame.time
    // a new bubble every so often, more when you're nearby
    c.next -= dt
    if (c.next <= 0) {
      blow()
      c.next = Math.abs(frame.camX - KID_X) < 10 ? 0.5 + Math.random() * 0.8 : 3
    }
    c.jump = Math.max(0, c.jump - dt)
    if (body.current) body.current.position.y = Math.sin((c.jump / 0.5) * Math.PI) * 0.12
    c.bubbles.forEach((b, i) => {
      const was = b.t < b.life
      b.t += dt
      const m = meshes.current[i]
      if (!m) return
      m.visible = b.t < b.life
      if (b.big && was && !m.visible) {
        // the giant one pops on its own, and the page falls out
        sound('pop', { x: KID_X, rate: 0.5 })
        setDropped(true)
        useStore.getState().say('kid', DROPPED, 2400)
      }
      if (!m.visible) return
      const rise = b.big ? Math.min(b.t * 0.45, 1.1) : b.t * 0.35
      m.position.set(WAND[0] + b.t * b.dx + Math.sin(b.t * 2 + b.seed) * 0.08, WAND[1] + rise + Math.sin(b.t * 3 + b.seed) * 0.04, b.dz * b.t)
      m.scale.setScalar(b.r * Math.min(1, b.t * 4) * (1 + Math.sin(b.t * 7 + b.seed) * 0.04))
      if (b.big) c.bigAt.set(KID_X + m.position.x, m.position.y, Z + m.position.z)
    })
    // the folded page inside the giant bubble
    const big = c.bubbles.find((b) => b.big && b.t < b.life)
    if (paper.current) {
      paper.current.visible = !!big
      if (big) {
        paper.current.position.set(c.bigAt.x - KID_X, c.bigAt.y, c.bigAt.z - Z)
        paper.current.rotation.set(Math.sin(t * 2) * 0.4, t * 1.5, 0.2)
      }
    }
  })

  return (
    <group>
      <group position={[KID_X, 0, Z]}>
        <CharLayer>
          <group ref={body} scale={0.66}>
            {[-0.06, 0.06].map((x) => (
              <mesh key={x} material={toon('#7A4E34')} position={[x, 0.3, 0]}>
                <capsuleGeometry args={[0.055, 0.42, 4, 8]} />
              </mesh>
            ))}
            <mesh material={toon('#3E6FB0')} position={[0, 0.62, 0]} scale={[1.15, 0.55, 0.8]}>
              <capsuleGeometry args={[0.15, 0.2, 4, 10]} />
            </mesh>
            {[0.86, 1.0, 1.14].map((y) => (
              <mesh key={y} material={toon(y === 1.0 ? '#F7EAD7' : '#E7C55A')} position={[0, y, 0]} scale={[1.1, 1, 0.75]}>
                <cylinderGeometry args={[0.15, 0.15, 0.13, 12]} />
              </mesh>
            ))}
            <group position={[0, 1.42, 0]}>
              <mesh material={toon('#7A4E34')}>
                <sphereGeometry args={[0.16, 12, 10]} />
              </mesh>
              <mesh material={face} position={[0, -0.01, 0.155]}>
                <planeGeometry args={[0.2, 0.175]} />
              </mesh>
              <mesh material={toon('#1A1020')} position={[0, 0.07, -0.01]} scale={[1.05, 0.7, 1.05]}>
                <sphereGeometry args={[0.16, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
              </mesh>
            </group>
            {/* arm out, holding the wand up to blow */}
            <mesh material={toon('#7A4E34')} position={[0.2, 1.2, 0.08]} rotation-z={-1.1}>
              <capsuleGeometry args={[0.04, 0.24, 4, 6]} />
            </mesh>
          </group>
          <mesh material={toon('#E04848')} position={[WAND[0], WAND[1] - 0.12, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.2, 4]} />
          </mesh>
          <mesh material={toon('#E04848')} position={[WAND[0], WAND[1], 0]}>
            <torusGeometry args={[0.04, 0.008, 4, 10]} />
          </mesh>
          {Array.from({ length: COUNT }, (_, i) => (
            <mesh key={i} ref={(m) => (meshes.current[i] = m)} visible={false} material={film}>
              <sphereGeometry args={[1, 10, 8]} />
              <mesh material={shine} position={[-0.4, 0.4, 0.7]}>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
              </mesh>
            </mesh>
          ))}
          <mesh ref={paper} material={toon('#FBF3E4')} visible={false}>
            <boxGeometry args={[0.12, 0.09, 0.01]} />
          </mesh>
        </CharLayer>
        <HitBox size={[0.9, 1.5, 0.8]} position={[0.15, 0.75, 0]} {...handlers} />
      </group>
      <PageSheet id="train" x={KID_X + 1.1} z={Z + 0.6} show={dropped || found} from={[KID_X + 0.9, 2.1, Z]} />
    </group>
  )
}

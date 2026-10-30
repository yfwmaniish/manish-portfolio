import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, MeshBasicMaterial, PointLight, Vector3 } from 'three'
import { sound } from '../../audio/bus'
import { BHUTTA_X } from '../../data/places'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { useStore } from '../../store/useStore'
import { useFace } from '../characters/faces'
import { CharLayer, HitBox } from '../characters/shared'
import { frame, LAYER_FX } from '../frame'
import { glowMaterial, toon } from '../materials'
import { PageSheet } from '../pages/PageSheet'

// On the way to Scene 2: a bhutta (roast corn) seller crouched over a tray of hot
// coals, fanning them with a woven fan. Fan them yourself and sparks fly. The first
// time, one of Ali's pages lifts out of the heat, a little singed at the corner.

const Z = 0.95
const SPARKS = 10
const PUFFS = 5
// DRAFT lines, Ali to approve.
const FIRST = 'Oye! Your paper almost went in my coals. Here.'
const LINES = ['Bhutta? Thirty rupees. Lemon, salt, chilli.', 'Arre, slowly! You will set the whole promenade on fire.', 'Okay, you fan. I will rest.', 'Very good fanning. Somebody hire this one.']

export function BhuttaWala() {
  const found = useStore((s) => s.pagesFound.includes('nicetry'))
  const [revealed, setRevealed] = useState(false)
  const face = useFace('Balloon wala')
  const fan = useRef<Group>(null)
  const sparks = useRef<(Mesh | null)[]>([])
  const light = useRef<PointLight>(null)
  const glow = useMemo(() => glowMaterial('#FF6A3A'), [])
  const ember = useMemo(() => new MeshBasicMaterial({ color: '#FFB067' }), [])
  const smoke = useMemo(() => Array.from({ length: PUFFS }, () => new MeshBasicMaterial({ color: '#C9B8D6', transparent: true, depthWrite: false })), [])
  const puffs = useRef<(Mesh | null)[]>([])
  const s = useRef({ fanning: 0, talks: 0, sparks: Array.from({ length: SPARKS }, () => ({ t: 9, x: 0, z: 0, v: 0 })) })
  const at = useMemo(() => new Vector3(BHUTTA_X, 1.55, Z), [])
  useAnchor('say-bhutta', () => at)

  const handlers = useInteractable({
    id: 'bhutta',
    label: 'Fan the coals',
    x: () => BHUTTA_X,
    onActivate: () => {
      const c = s.current
      c.fanning = 1.6
      c.sparks.forEach((p, i) => Object.assign(p, { t: -i * 0.06, x: (Math.random() - 0.5) * 0.4, z: (Math.random() - 0.5) * 0.25, v: 0.8 + Math.random() * 0.8 }))
      sound('paperSlide', { x: BHUTTA_X })
      sound('pop', { x: BHUTTA_X, rate: 0.6 })
      let line: string
      if (!revealed && !found) {
        setRevealed(true)
        line = FIRST
      } else line = LINES[Math.min(c.talks++, LINES.length - 1)]
      useStore.getState().say('bhutta', line, 2600)
    },
  })

  useFrame((_, dt) => {
    const c = s.current
    const t = frame.time
    c.fanning = Math.max(0, c.fanning - dt)
    // he fans slowly on his own, and fast while you fan
    if (fan.current) fan.current.rotation.z = Math.sin(t * (c.fanning > 0 ? 22 : 4)) * (c.fanning > 0 ? 0.6 : 0.3)
    const heat = 0.55 + Math.sin(t * 5) * 0.12 + Math.sin(t * 13) * 0.06 + c.fanning * 0.3
    glow.opacity = Math.min(1, heat)
    if (light.current) light.current.intensity = 1.2 + heat * 1.5
    // lazy smoke curling up off the coals
    puffs.current.forEach((m, i) => {
      if (!m) return
      const life = ((t * 0.35 + i / PUFFS) % 1)
      m.position.set(Math.sin(life * 5 + i) * 0.12 + life * 0.25, 1.0 + life * 1.3, 0)
      m.scale.setScalar(0.08 + life * 0.22)
      smoke[i].opacity = 0.35 * (1 - life)
    })
    c.sparks.forEach((p, i) => {
      p.t += dt
      const m = sparks.current[i]
      if (!m) return
      const life = p.t / 1.3
      m.visible = p.t > 0 && life < 1
      if (!m.visible) return
      m.position.set(p.x + Math.sin(p.t * 6 + i) * 0.05, 0.86 + p.t * p.v, p.z)
      m.scale.setScalar(1 - life)
    })
  })

  return (
    <group>
      <group position={[BHUTTA_X, 0, Z]}>
        <CharLayer>
          {/* a low tin tray of coals on a stand, cobs roasting on the grill */}
          {[-0.3, 0.3].map((lx) =>
            [-0.15, 0.15].map((lz) => (
              <mesh key={`${lx}${lz}`} material={toon('#3A3048')} position={[lx, 0.38, lz]} rotation-z={lx * -0.25}>
                <boxGeometry args={[0.035, 0.78, 0.035]} />
              </mesh>
            )),
          )}
          <mesh material={toon('#5A4D6E')} position={[0, 0.8, 0]}>
            <boxGeometry args={[0.7, 0.1, 0.38]} />
          </mesh>
          <mesh position={[0, 0.86, 0]}>
            <boxGeometry args={[0.6, 0.03, 0.3]} />
            <meshBasicMaterial color="#FF6A3A" />
          </mesh>
          {[-0.18, 0, 0.18].map((cx, i) => (
            <group key={cx} position={[cx, 0.92, 0.02]} rotation={[0, 0.2 * (i - 1), Math.PI / 2]}>
              <mesh material={toon('#E7C55A')}>
                <capsuleGeometry args={[0.035, 0.16, 3, 6]} />
              </mesh>
              <mesh material={toon('#6E8A3A')} position={[0, -0.13, 0]}>
                <coneGeometry args={[0.03, 0.08, 5]} />
              </mesh>
            </group>
          ))}
          {/* a basket of cobs waiting */}
          <mesh material={toon('#8A5A3C')} position={[0.6, 0.15, 0.1]}>
            <cylinderGeometry args={[0.2, 0.16, 0.3, 8]} />
          </mesh>
          {[-0.08, 0.06, 0.0].map((bx, i) => (
            <mesh key={i} material={toon(i % 2 ? '#6E8A3A' : '#E7C55A')} position={[0.6 + bx, 0.34, 0.1 + bx]} rotation-z={0.5 - i * 0.4}>
              <capsuleGeometry args={[0.035, 0.14, 3, 6]} />
            </mesh>
          ))}
          {/* the seller, crouched behind the tray */}
          <group position={[-0.15, 0, -0.42]}>
            <mesh material={toon('#F7EAD7')} position={[0, 0.3, 0]} scale={[1.3, 0.6, 1]}>
              <sphereGeometry args={[0.2, 10, 8]} />
            </mesh>
            <mesh material={toon('#C0504A')} position={[0, 0.66, 0]} scale={[1.1, 1, 0.8]}>
              <capsuleGeometry args={[0.15, 0.22, 4, 10]} />
            </mesh>
            <group position={[0, 1.0, 0.02]}>
              <mesh material={toon('#7A4E34')}>
                <sphereGeometry args={[0.13, 12, 10]} />
              </mesh>
              <mesh material={face} position={[0, -0.01, 0.127]}>
                <planeGeometry args={[0.17, 0.148]} />
              </mesh>
              <mesh material={toon('#F7EAD7')} position={[0, 0.08, 0]} scale={[1.05, 0.4, 1.05]}>
                <sphereGeometry args={[0.135, 10, 6]} />
              </mesh>
            </group>
            {/* the arm with the fan */}
            <mesh material={toon('#7A4E34')} position={[0.2, 0.72, 0.15]} rotation-x={-0.9}>
              <capsuleGeometry args={[0.035, 0.24, 4, 6]} />
            </mesh>
            <group ref={fan} position={[0.24, 0.8, 0.36]}>
              <mesh material={toon('#C9A46A')} position={[0, 0.12, 0]}>
                <boxGeometry args={[0.2, 0.2, 0.015]} />
              </mesh>
              <mesh material={toon('#5A3A2A')}>
                <boxGeometry args={[0.02, 0.12, 0.02]} />
              </mesh>
            </group>
          </group>
          {Array.from({ length: PUFFS }, (_, i) => (
            <mesh key={`p${i}`} ref={(m) => (puffs.current[i] = m)} material={smoke[i]}>
              <boxGeometry args={[1, 1, 0.01]} />
            </mesh>
          ))}
          {Array.from({ length: SPARKS }, (_, i) => (
            <mesh key={i} ref={(m) => (sparks.current[i] = m)} material={ember} visible={false}>
              <boxGeometry args={[0.025, 0.025, 0.025]} />
            </mesh>
          ))}
        </CharLayer>
        <mesh material={glow} position={[0, 0.9, 0.2]} layers={LAYER_FX}>
          <planeGeometry args={[1.4, 0.9]} />
        </mesh>
        <pointLight ref={(l) => { light.current = l; l?.layers.enableAll() }} position={[0, 1.1, 0.3]} color="#FF8A4C" distance={3.5} decay={2} />
        <HitBox size={[1.4, 1.5, 1.2]} position={[0, 0.7, -0.15]} {...handlers} />
      </group>
      {/* Ali's page, lifted out of the heat */}
      <PageSheet id="nicetry" x={BHUTTA_X + 0.95} z={Z + 0.3} show={revealed || found} from={[BHUTTA_X, 1.7, Z]} />
    </group>
  )
}

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, MeshBasicMaterial } from 'three'
import { ss } from '../../lib/time'
import { frame, LAYER_FX } from '../frame'
import { HEAD, lampX } from '../Lamps'
import { SEA_Y } from '../Sea'

// Small life that makes the night feel lived in: moths around the lamps, bats
// after dark, kites at dusk, and mist lying on the sea at first light.

export function Ambience() {
  return (
    <>
      <Moths />
      <Bats />
      <Kites />
      <Mist />
    </>
  )
}

const FIRST_X = lampX(0)
const SPACING = lampX(1) - lampX(0)
const LAMPS_NEAR = 3
const PER_LAMP = 4

/** A few pale moths circling the lamps nearest you, once they're lit. */
function Moths() {
  const moths = useRef<(Mesh | null)[]>([])
  const mat = useMemo(() => new MeshBasicMaterial({ color: '#F7EAD7' }), [])
  useFrame(() => {
    const { tod, camX, time } = frame
    const on = tod.lights > 0.4 && tod.rain < 0.3
    const nearest = Math.round((camX - FIRST_X) / SPACING)
    moths.current.forEach((m, i) => {
      if (!m) return
      m.visible = on
      if (!on) return
      const lamp = nearest - 1 + Math.floor(i / PER_LAMP)
      const k = i % PER_LAMP
      const t = time * (1.6 + k * 0.35) + k * 1.7
      // erratic little loops under the lamp head
      m.position.set(lampX(lamp) + Math.sin(t) * 0.35 + Math.sin(t * 3.1) * 0.08, HEAD.y - 0.35 + Math.sin(t * 1.7) * 0.2, HEAD.z + Math.cos(t * 1.3) * 0.3)
      m.scale.x = Math.sin(time * 40 + i) > 0 ? 1 : 0.4
    })
  })
  return (
    <>
      {Array.from({ length: LAMPS_NEAR * PER_LAMP }, (_, i) => (
        <mesh key={i} ref={(m) => (moths.current[i] = m)} material={mat} visible={false}>
          <boxGeometry args={[0.045, 0.025, 0.02]} />
        </mesh>
      ))}
    </>
  )
}

const BATS = 5

/** Bats flitting over the promenade in the dark middle of the night. */
function Bats() {
  const bats = useRef<(Group | null)[]>([])
  const mat = useMemo(() => new MeshBasicMaterial({ color: '#141022', transparent: true }), [])
  useFrame(() => {
    const { tod, camX, time } = frame
    mat.opacity = ss(0.45, 0.55, tod.p) * (1 - ss(0.8, 0.88, tod.p)) * (1 - tod.rain)
    bats.current.forEach((b, i) => {
      if (!b) return
      b.visible = mat.opacity > 0.05
      const t = time * 0.35 + i * 1.9
      // wide, jerky loops above the lamps
      b.position.set(camX + Math.sin(t) * 9 + Math.sin(t * 4.3) * 0.6, 5.2 + Math.sin(t * 2.2) * 1.1 + i * 0.3, -3 - i * 1.5)
      const flap = Math.sin(time * 22 + i * 2) * 0.7
      b.children[0].rotation.z = flap
      b.children[1].rotation.z = -flap
    })
  })
  return (
    <>
      {Array.from({ length: BATS }, (_, i) => (
        <group key={i} ref={(b) => (bats.current[i] = b)} visible={false}>
          {[1, -1].map((side) => (
            <group key={side} scale-x={side}>
              <mesh material={mat} position={[0.09, 0, 0]}>
                <boxGeometry args={[0.18, 0.05, 0.02]} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </>
  )
}

// Far out over the water, low enough to sit in the sky above the skyline.
const KITES = [
  { x: 6, y: 5.6, z: -22, color: '#E04848', tail: '#FFC56B' },
  { x: 19, y: 6.4, z: -30, color: '#7FD1C7', tail: '#F7EAD7' },
  { x: 31, y: 5.2, z: -26, color: '#FFC56B', tail: '#E04848' },
]

/** Kites over the sea at dusk, swaying in the breeze; gone once it's dark. */
function Kites() {
  const kites = useRef<(Group | null)[]>([])
  const mats = useMemo(() => KITES.map((k) => [new MeshBasicMaterial({ color: k.color, transparent: true }), new MeshBasicMaterial({ color: k.tail, transparent: true })]), [])
  useFrame(() => {
    const { tod, time } = frame
    const vis = 1 - ss(0.2, 0.3, tod.p)
    mats.forEach(([a, b]) => (a.opacity = b.opacity = vis))
    kites.current.forEach((g, i) => {
      if (!g) return
      g.visible = vis > 0.05
      const k = KITES[i]
      g.position.set(k.x + Math.sin(time * 0.5 + i) * 0.6, k.y + Math.sin(time * 0.8 + i * 2) * 0.4, k.z)
      g.rotation.z = Math.sin(time * 1.1 + i) * 0.25
    })
  })
  return (
    <>
      {KITES.map((_, i) => (
        <group key={i} ref={(g) => (kites.current[i] = g)}>
          <mesh material={mats[i][0]} rotation-z={Math.PI / 4}>
            <boxGeometry args={[0.8, 0.8, 0.02]} />
          </mesh>
          {[0, 1, 2].map((j) => (
            <mesh key={j} material={mats[i][1]} position={[Math.sin(j) * 0.15, -0.7 - j * 0.3, 0]}>
              <boxGeometry args={[0.15, 0.15, 0.02]} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  )
}

/** Soft bands of mist lying on the water as the sun comes up. */
function Mist() {
  const group = useRef<Group>(null)
  const mats = useMemo(() => [0.3, 0.2, 0.14].map((o) => ({ m: new MeshBasicMaterial({ color: '#F2D8D0', transparent: true, depthWrite: false }), o })), [])
  useFrame(() => {
    const { tod, camX, time } = frame
    const k = tod.dawn
    mats.forEach(({ m, o }, i) => (m.opacity = k * o * (0.85 + 0.15 * Math.sin(time * 0.3 + i))))
    if (group.current) {
      group.current.visible = k > 0.02
      group.current.position.x = camX
    }
  })
  return (
    <group ref={group} visible={false}>
      {mats.map(({ m }, i) => (
        <mesh key={i} material={m} position={[i * 6 - 6, SEA_Y + 0.4 + i * 0.5, -14 - i * 18]} layers={LAYER_FX}>
          <planeGeometry args={[90, 0.7 + i * 0.5]} />
        </mesh>
      ))}
    </group>
  )
}

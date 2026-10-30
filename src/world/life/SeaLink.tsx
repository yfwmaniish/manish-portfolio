import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Group, Mesh, MeshBasicMaterial } from 'three'
import { frame } from '../frame'
import { SEA_Y } from '../Sea'

// The Bandra–Worli sea link, far off across the water: two cable-stayed pylons,
// blinking red aircraft lights, and car lights crawling along the deck.
const PARALLAX = 0.9
const Z = -265
const DECK_Y = SEA_Y + 3
const X0 = -62
const X1 = -8
const PYLONS = [-44, -26]
const CARS = 6

export function SeaLink() {
  const group = useRef<Group>(null)
  const beacons = useRef<(Mesh | null)[]>([])
  const cars = useRef<(Mesh | null)[]>([])
  const fill = useMemo(() => new MeshBasicMaterial({ color: '#24173A' }), [])
  const cable = useMemo(() => new MeshBasicMaterial({ color: '#3A2550' }), [])
  const c = useMemo(
    () => ({ dusk: new Color('#24173A'), night: new Color('#0C0A1E'), cDusk: new Color('#3A2550'), cNight: new Color('#1A1638') }),
    [],
  )

  // Cables fan from each pylon top down to the deck.
  const cables = useMemo(() => {
    const out: { x: number; y: number; len: number; rot: number }[] = []
    for (const px of PYLONS)
      for (const dx of [-9, -5, 5, 9]) {
        const top = DECK_Y + 8.5
        const x2 = px + dx
        const len = Math.hypot(dx, top - DECK_Y)
        out.push({ x: (px + x2) / 2, y: (top + DECK_Y) / 2, len, rot: Math.atan2(top - DECK_Y, -dx) - Math.PI / 2 })
      }
    return out
  }, [])

  useFrame(() => {
    const { tod, camX, time } = frame
    if (group.current) group.current.position.x = camX * PARALLAX
    fill.color.copy(c.dusk).lerp(c.night, tod.night)
    cable.color.copy(c.cDusk).lerp(c.cNight, tod.night)
    beacons.current.forEach((b, i) => b && (b.visible = (time + i * 0.8) % 1.6 < 0.9))
    cars.current.forEach((m, i) => {
      if (!m) return
      const dir = i % 2 ? 1 : -1
      const u = ((time * 0.05 + i / CARS) % 1 + 1) % 1
      m.position.x = dir > 0 ? X0 + u * (X1 - X0) : X1 - u * (X1 - X0)
      m.visible = tod.lights > 0.3
    })
  })

  return (
    <group ref={group}>
      <mesh material={fill} position={[(X0 + X1) / 2, DECK_Y, Z]}>
        <boxGeometry args={[X1 - X0, 0.5, 1]} />
      </mesh>
      {PYLONS.map((x, i) => (
        <group key={x}>
          <mesh material={fill} position={[x, DECK_Y + 4.5, Z]}>
            <boxGeometry args={[0.8, 9, 0.8]} />
          </mesh>
          <mesh ref={(m) => (beacons.current[i] = m)} position={[x, DECK_Y + 9.2, Z]}>
            <boxGeometry args={[0.7, 0.6, 0.6]} />
            <meshBasicMaterial color="#FF5A5A" />
          </mesh>
        </group>
      ))}
      {cables.map((k, i) => (
        <mesh key={i} material={cable} position={[k.x, k.y, Z]} rotation-z={k.rot}>
          <boxGeometry args={[0.3, k.len, 0.3]} />
        </mesh>
      ))}
      {Array.from({ length: CARS }, (_, i) => (
        <mesh key={i} ref={(m) => (cars.current[i] = m)} position={[0, DECK_Y + 0.35, Z + 0.6]}>
          <boxGeometry args={[0.5, 0.25, 0.1]} />
          <meshBasicMaterial color={i % 2 ? '#FFE3A8' : '#FF6B5A'} />
        </mesh>
      ))}
    </group>
  )
}

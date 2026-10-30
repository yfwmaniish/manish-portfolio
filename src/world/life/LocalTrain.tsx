import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Group, MeshBasicMaterial } from 'three'
import { sound } from '../../audio/bus'
import { frame } from '../frame'
import { SEA_Y } from '../Sea'

// A Mumbai local, far off along the shore under the skyline: maroon coaches with a
// cream window band and a yellow stripe, windows glowing after dark. It rattles
// across every minute and a half (its horn sounds as it comes into view), and it
// stops running in the dead of night, like the real ones.

const Z = -140
const Y = SEA_Y + 1.1
const COACHES = 9
const COACH = 7.2
const GAP = 0.4
const LENGTH = COACHES * (COACH + GAP)
const SPAN = 220
const PERIOD = 90
const CROSS = 32
const PARALLAX = 0.88
const WINDOWS = 6

/** Locals run until about 1 AM and start again before dawn. */
const running = (p: number) => p < 0.62 || p > 0.84

export function LocalTrain() {
  const group = useRef<Group>(null)
  const lastRun = useRef(-1)
  const mats = useMemo(
    () => ({
      body: new MeshBasicMaterial({ color: '#6E2034' }),
      band: new MeshBasicMaterial({ color: '#D8CCB0' }),
      stripe: new MeshBasicMaterial({ color: '#E7C55A' }),
      roof: new MeshBasicMaterial({ color: '#3A3048' }),
      window: new MeshBasicMaterial({ color: '#2A2440' }),
    }),
    [],
  )
  const tint = useMemo(() => ({ day: new Color('#2A2440'), lit: new Color('#FFE3A8'), dusk: new Color('#6E2034'), night: new Color('#3A1828') }), [])

  useFrame(() => {
    const { tod, camX, time } = frame
    const g = group.current
    if (!g) return
    const run = Math.floor(time / PERIOD)
    const t = (time % PERIOD) / CROSS
    g.visible = running(tod.p) && t < 1
    if (!g.visible) return
    // its horn, once per crossing, as it comes into view
    if (run !== lastRun.current) {
      lastRun.current = run
      sound('trainHorn', { x: camX + (Math.random() - 0.5) * 8 })
    }
    g.position.set(camX * PARALLAX - SPAN / 2 - LENGTH + t * (SPAN + LENGTH), Y + Math.sin(time * 9) * 0.03, Z)
    // windows light up as the city does; the paint darkens into the night
    mats.window.color.copy(tint.day).lerp(tint.lit, tod.lights)
    mats.body.color.copy(tint.dusk).lerp(tint.night, tod.night * 0.7)
  })

  return (
    <group ref={group} visible={false}>
      {Array.from({ length: COACHES }, (_, c) => (
        <group key={c} position={[c * (COACH + GAP), 0, 0]}>
          <mesh material={mats.body} position={[COACH / 2, 0, 0]}>
            <boxGeometry args={[COACH, 1.4, 1]} />
          </mesh>
          <mesh material={mats.band} position={[COACH / 2, 0.22, 0.51]}>
            <planeGeometry args={[COACH, 0.5]} />
          </mesh>
          <mesh material={mats.stripe} position={[COACH / 2, -0.12, 0.51]}>
            <planeGeometry args={[COACH, 0.12]} />
          </mesh>
          <mesh material={mats.roof} position={[COACH / 2, 0.8, 0]}>
            <boxGeometry args={[COACH, 0.2, 1]} />
          </mesh>
          {Array.from({ length: WINDOWS }, (_, w) => (
            <mesh key={w} material={mats.window} position={[0.7 + w * ((COACH - 1.4) / (WINDOWS - 1)), 0.22, 0.52]}>
              <planeGeometry args={[0.55, 0.32]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

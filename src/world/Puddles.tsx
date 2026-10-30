import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, MeshBasicMaterial } from 'three'
import { ss } from '../lib/time'
import { skyBand } from '../lib/palette'
import { frame, LAYER_FX } from './frame'
import { lampX } from './Lamps'
import { glowMaterial } from './materials'

// After the monsoon the promenade stays wet: puddles that mirror the sky, and catch
// a smear of lamp light where there's a lamp nearby. Scattered from the rain onwards.
const PUDDLES: [number, number, number, number][] = [
  // x, z, width, depth
  [49.5, 0.6, 1.4, 0.5],
  [53.2, 1.8, 0.9, 0.35],
  [58.9, -0.4, 1.2, 0.45],
  [62.4, 1.2, 1.6, 0.55],
  [66.1, 2.3, 0.8, 0.3],
  [70.3, 0.1, 1.3, 0.5],
  [74.6, 1.6, 1.1, 0.4],
  [78.2, -0.6, 1.5, 0.5],
  [81.5, 1.9, 0.9, 0.35],
  [88.6, 0.9, 1.4, 0.5],
  [92.4, -0.3, 1.0, 0.4],
  [97.1, 1.4, 1.3, 0.45],
]

export function Puddles() {
  const water = useMemo(() => new MeshBasicMaterial({ color: '#1B2550', transparent: true, depthWrite: false }), [])
  const shine = useMemo(() => glowMaterial('#FFC56B'), [])
  const tint = useMemo(() => new Color(), [])
  // which puddles sit close enough to a lamp to reflect it
  const lit = useMemo(
    () => PUDDLES.map(([x]) => Array.from({ length: 32 }, (_, i) => lampX(i)).some((lx) => Math.abs(lx - x) < 2.2)),
    [],
  )

  useFrame(() => {
    const { tod } = frame
    const wet = ss(0.31, 0.42, tod.p)
    skyBand(tint, 4, tod).multiplyScalar(0.6)
    water.color.copy(tint)
    water.opacity = wet * 0.8
    shine.opacity = wet * tod.lights * 0.6
  })

  return (
    <group>
      {PUDDLES.map(([x, z, w, d], i) => (
        <group key={x} position={[x, 0.012, z]} rotation-x={-Math.PI / 2}>
          <mesh material={water} scale={[w, d, 1]}>
            <circleGeometry args={[0.5, 10]} />
          </mesh>
          {lit[i] && (
            <mesh material={shine} position={[0, 0, 0.002]} scale={[w * 0.5, d * 1.3, 1]} layers={LAYER_FX}>
              <planeGeometry args={[1, 1]} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

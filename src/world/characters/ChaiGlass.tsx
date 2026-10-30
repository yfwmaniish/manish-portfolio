import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeElements } from '@react-three/fiber'
import type { Group } from 'three'
import { frame } from '../frame'
import { toon } from '../materials'
import { CharLayer } from './shared'

/** A cutting chai glass with a wisp of steam. `level` is how full it is (0–1). */
export function ChaiGlass({ level = 0.8, steam = true, ...props }: { level?: number; steam?: boolean } & ThreeElements['group']) {
  const wisps = useRef<(Group | null)[]>([])

  useFrame(() => {
    wisps.current.forEach((w, i) => {
      if (!w) return
      const u = (frame.time * 0.7 + i / 3) % 1
      w.position.set(Math.sin(u * 6 + i) * 0.01, 0.1 + u * 0.12, 0)
      w.scale.setScalar(u < 0.8 ? 1 : (1 - u) * 5)
    })
  })

  const h = 0.085
  return (
    <CharLayer {...props}>
      {/* glass walls, a little lighter than the tea */}
      <mesh material={toon('#E8D9B0')} position={[0, h / 2, 0]}>
        <boxGeometry args={[0.05, h, 0.05]} />
      </mesh>
      <mesh material={toon('#C88A3C')} position={[0, (h * level) / 2, 0.001]}>
        <boxGeometry args={[0.052, h * level, 0.052]} />
      </mesh>
      {steam &&
        [0, 1, 2].map((i) => (
          <group key={i} ref={(w) => (wisps.current[i] = w)}>
            <mesh material={toon('#F7EAD7')}>
              <boxGeometry args={[0.015, 0.02, 0.015]} />
            </mesh>
          </group>
        ))}
    </CharLayer>
  )
}

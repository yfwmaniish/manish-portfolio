import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, Color, MeshBasicMaterial, NearestFilter, PointLight, SRGBColorSpace } from 'three'
import { frame, LAYER_FX } from '../frame'
import { glowMaterial, toon } from '../materials'
import { useStore } from '../../store/useStore'

// Prototype cart colours: yellow and maroon stripes, lilac kettle.
const YELLOW = '#E7C55A'
const MAROON = '#6B2238'
const WOOD = '#5A3A2A'

function signTexture() {
  const c = document.createElement('canvas')
  c.width = 24
  c.height = 8
  const g = c.getContext('2d')!
  g.fillStyle = MAROON
  g.fillRect(0, 0, 24, 8)
  g.fillStyle = YELLOW
  // C H A I in 3×5 pixel letters
  const glyphs: Record<string, string[]> = {
    C: ['XXX', 'X..', 'X..', 'X..', 'XXX'],
    H: ['X.X', 'X.X', 'XXX', 'X.X', 'X.X'],
    A: ['.X.', 'X.X', 'XXX', 'X.X', 'X.X'],
    I: ['XXX', '.X.', '.X.', '.X.', 'XXX'],
  }
  ;['C', 'H', 'A', 'I'].forEach((ch, i) =>
    glyphs[ch].forEach((row, y) => [...row].forEach((p, x) => p === 'X' && g.fillRect(4 + i * 4 + x, 1 + y + 0.5, 1, 1))),
  )
  const t = new CanvasTexture(c)
  t.magFilter = t.minFilter = NearestFilter
  t.colorSpace = SRGBColorSpace
  return t
}

/**
 * The chai cart, on the promenade against the wall. Lives on the environment layer;
 * the chai wala stands behind it. The bulb stays on at dawn if you cleared Ali's tab.
 */
export function ChaiCart({ x, z }: { x: number; z: number }) {
  const sign = useMemo(() => new MeshBasicMaterial({ map: signTexture() }), [])
  const bulbGlow = useMemo(() => glowMaterial('#FFC56B'), [])
  const coalGlow = useMemo(() => glowMaterial('#FF6A3A'), [])
  const bulb = useRef<MeshBasicMaterial>(null)
  const light = useRef<PointLight>(null)
  const c = useMemo(() => ({ off: new Color('#5A4D6E'), on: new Color('#FFE3A8') }), [])

  useFrame(() => {
    const paid = !!useStore.getState().flags.chai_debt_paid
    const L = paid ? Math.max(frame.tod.lights, 0.9) : frame.tod.lights
    bulb.current?.color.copy(c.off).lerp(c.on, L)
    bulbGlow.opacity = L * 0.8
    coalGlow.opacity = 0.5 + Math.sin(frame.time * 5) * 0.15 + Math.sin(frame.time * 13) * 0.08
    if (light.current) light.current.intensity = L * 2.5
  })

  const stripes = 7
  return (
    <group position={[x, 0, z]}>
      {/* body and counter */}
      <mesh material={toon(MAROON)} position={[0, 0.5, 0]}>
        <boxGeometry args={[1.3, 0.62, 0.6]} />
      </mesh>
      <mesh material={toon(YELLOW)} position={[0, 0.83, 0]}>
        <boxGeometry args={[1.38, 0.05, 0.66]} />
      </mesh>
      <mesh material={sign} position={[0, 0.5, 0.302]}>
        <planeGeometry args={[0.72, 0.24]} />
      </mesh>
      {/* wheels */}
      {[-0.5, 0.5].map((wx) => (
        <mesh key={wx} material={toon('#1A1424')} position={[wx, 0.16, 0.31]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.16, 0.16, 0.05, 8]} />
        </mesh>
      ))}
      {/* poles and the striped awning, tipped toward the promenade */}
      {[-0.62, 0.62].map((px) =>
        [-0.26, 0.26].map((pz) => (
          <mesh key={`${px}${pz}`} material={toon(WOOD)} position={[px, 1.35, pz]}>
            <boxGeometry args={[0.04, 1.0, 0.04]} />
          </mesh>
        )),
      )}
      <group position={[0, 1.88, 0]} rotation-x={0.12}>
        {Array.from({ length: stripes }, (_, i) => (
          <mesh key={i} material={toon(i % 2 ? MAROON : YELLOW)} position={[-0.72 + (i + 0.5) * (1.44 / stripes), 0, 0]}>
            <boxGeometry args={[1.44 / stripes, 0.05, 0.8]} />
          </mesh>
        ))}
        {/* scalloped front edge */}
        {Array.from({ length: stripes }, (_, i) => (
          <mesh key={`e${i}`} material={toon(i % 2 ? MAROON : YELLOW)} position={[-0.72 + (i + 0.5) * (1.44 / stripes), -0.06, 0.4]}>
            <boxGeometry args={[1.44 / stripes, 0.1, 0.02]} />
          </mesh>
        ))}
      </group>
      {/* stove with coals; the kettle belongs to the chai wala */}
      <mesh material={toon('#2A2238')} position={[-0.32, 0.92, -0.05]}>
        <boxGeometry args={[0.26, 0.13, 0.22]} />
      </mesh>
      <mesh position={[-0.32, 0.99, -0.05]}>
        <boxGeometry args={[0.18, 0.02, 0.15]} />
        <meshBasicMaterial color="#FF6A3A" />
      </mesh>
      <mesh material={coalGlow} position={[-0.32, 0.98, 0.15]} layers={LAYER_FX}>
        <planeGeometry args={[0.6, 0.4]} />
      </mesh>
      {/* glasses waiting upside down, a biscuit jar */}
      {[0.12, 0.2, 0.28].map((gx) => (
        <mesh key={gx} material={toon('#E8D9B0')} position={[gx, 0.89, 0.12]}>
          <boxGeometry args={[0.05, 0.07, 0.05]} />
        </mesh>
      ))}
      <mesh material={toon('#C9D8F0')} position={[0.48, 0.95, -0.08]}>
        <boxGeometry args={[0.14, 0.2, 0.14]} />
      </mesh>
      <mesh material={toon('#D9A35A')} position={[0.48, 0.9, -0.08]}>
        <boxGeometry args={[0.12, 0.08, 0.12]} />
      </mesh>
      {/* hanging bulb */}
      <mesh material={toon('#2A2238')} position={[0.1, 1.74, 0.1]}>
        <boxGeometry args={[0.01, 0.2, 0.01]} />
      </mesh>
      <mesh position={[0.1, 1.62, 0.1]}>
        <boxGeometry args={[0.06, 0.07, 0.06]} />
        <meshBasicMaterial ref={bulb} color="#5A4D6E" />
      </mesh>
      <mesh material={bulbGlow} position={[0.1, 1.62, 0.3]} layers={LAYER_FX}>
        <planeGeometry args={[0.9, 0.9]} />
      </mesh>
      <pointLight
        ref={(l) => {
          light.current = l
          l?.layers.enableAll()
        }}
        position={[0.1, 1.55, 0.4]}
        color="#FFC56B"
        distance={3.5}
        decay={1.5}
        intensity={0}
      />
    </group>
  )
}

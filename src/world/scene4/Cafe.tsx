import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, MeshToonMaterial, NearestFilter, PointLight, RepeatWrapping, SRGBColorSpace } from 'three'
import { frame, LAYER_FX } from '../frame'
import { glowMaterial, ramp, toon } from '../materials'
import { WALL_FRONT_Z } from '../Promenade'

// Scene 4: a table outside a little Irani café kiosk on the promenade.
export const CAFE_X = 86.8
export const TABLE_X = 83.9
export const TABLE_Z = -0.25
const KIOSK_Z = WALL_FRONT_Z + 0.45

function texture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const t = new CanvasTexture(c)
  t.magFilter = t.minFilter = NearestFilter
  t.colorSpace = SRGBColorSpace
  const redraw = () => {
    draw(c.getContext('2d')!)
    t.needsUpdate = true
  }
  redraw()
  return { t, redraw }
}

export function Cafe() {
  const light = useRef<PointLight>(null)
  const glow = useMemo(() => glowMaterial('#FFC56B'), [])
  const tiles = useMemo(() => {
    const { t } = texture(4, 4, (g) => {
      g.fillStyle = '#E8E2D8'
      g.fillRect(0, 0, 4, 4)
      g.fillStyle = '#1E1630'
      g.fillRect(0, 0, 2, 2)
      g.fillRect(2, 2, 2, 2)
    })
    t.wrapS = t.wrapT = RepeatWrapping
    t.repeat.set(8, 5)
    return new MeshToonMaterial({ map: t, gradientMap: ramp })
  }, [])
  const sign = useMemo(() => {
    const s = texture(128, 32, (g) => {
      g.fillStyle = '#1F4A3E'
      g.fillRect(0, 0, 128, 32)
      g.fillStyle = '#E7C55A'
      g.fillRect(2, 2, 124, 1)
      g.fillRect(2, 29, 124, 1)
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      g.font = 'bold 13px "Pixelify Sans", monospace'
      g.fillText('IRANI CAFÉ', 64, 13)
      g.font = '7px Silkscreen, monospace'
      g.fillStyle = '#F7EAD7'
      g.fillText('BUN MASKA · CHAI', 64, 24)
    })
    return { ...s, material: new MeshToonMaterial({ map: s.t, gradientMap: ramp }) }
  }, [])
  useEffect(() => {
    document.fonts?.ready.then(sign.redraw)
  }, [sign])

  useFrame(() => {
    const L = frame.tod.lights
    glow.opacity = 0.2 + L * 0.35
    if (light.current) light.current.intensity = 0.8 + L * 2.2
  })

  return (
    <group>
      {/* the kiosk: chequered counter, marble top, glass jars, a sign and a bulb */}
      <group position={[CAFE_X, 0, KIOSK_Z]}>
        <mesh material={tiles} position={[0, 0.5, 0]}>
          <boxGeometry args={[1.7, 1.0, 0.6]} />
        </mesh>
        <mesh material={toon('#E8E2D8')} position={[0, 1.02, 0.02]}>
          <boxGeometry args={[1.8, 0.05, 0.68]} />
        </mesh>
        {[-0.55, -0.25, 0.05].map((x, i) => (
          <group key={x} position={[x, 1.16, 0.05]}>
            <mesh material={toon('#C9E0E8')}>
              <cylinderGeometry args={[0.1, 0.1, 0.22, 10]} />
            </mesh>
            <mesh material={toon(['#D9A35A', '#C88A3C', '#E7C55A'][i])} position={[0, -0.04, 0]}>
              <cylinderGeometry args={[0.085, 0.085, 0.12, 10]} />
            </mesh>
          </group>
        ))}
        {[-0.85, 0.85].map((x) => (
          <mesh key={x} material={toon('#3A2A24')} position={[x, 1.55, 0]}>
            <boxGeometry args={[0.06, 1.1, 0.06]} />
          </mesh>
        ))}
        <mesh material={sign.material} position={[0, 2.12, 0.04]}>
          <planeGeometry args={[1.8, 0.45]} />
        </mesh>
        <mesh material={toon('#2A2238')} position={[0.45, 1.8, 0.2]}>
          <boxGeometry args={[0.01, 0.4, 0.01]} />
        </mesh>
        <mesh position={[0.45, 1.58, 0.2]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshBasicMaterial color="#FFE3A8" />
        </mesh>
        <mesh material={glow} position={[0.45, 1.58, 0.35]} layers={LAYER_FX}>
          <planeGeometry args={[0.55, 0.55]} />
        </mesh>
        <pointLight
          ref={(l) => {
            light.current = l
            l?.layers.enableAll()
          }}
          position={[0.2, 1.6, 0.8]}
          color="#FFC56B"
          distance={4.5}
          decay={1.4}
        />
      </group>

      {/* marble-top table, bun maska on a plate */}
      <group position={[TABLE_X, 0, TABLE_Z]}>
        <mesh material={toon('#E8E2D8')} position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.035, 16]} />
        </mesh>
        <mesh material={toon('#2A2238')} position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.72, 6]} />
        </mesh>
        <mesh material={toon('#2A2238')} position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.18, 0.2, 0.04, 10]} />
        </mesh>
        <mesh material={toon('#F7EAD7')} position={[0.18, 0.745, 0.08]}>
          <cylinderGeometry args={[0.09, 0.07, 0.012, 12]} />
        </mesh>
        <mesh material={toon('#D9A35A')} position={[0.18, 0.775, 0.08]} scale={[1, 0.55, 1]}>
          <sphereGeometry args={[0.065, 10, 8]} />
        </mesh>
        <mesh material={toon('#FFE3A8')} position={[0.18, 0.786, 0.08]} scale={[1, 0.2, 1]}>
          <sphereGeometry args={[0.04, 8, 4]} />
        </mesh>
      </group>
      <BentwoodChair x={TABLE_X} z={TABLE_Z - 0.48} />
      <BentwoodChair x={TABLE_X + 0.62} z={TABLE_Z + 0.08} turn={-1.4} />
    </group>
  )
}

/** The classic Irani café chair: round seat, a hooped back. */
function BentwoodChair({ x, z, turn = 0 }: { x: number; z: number; turn?: number }) {
  const wood = toon('#4A2E22')
  return (
    <group position={[x, 0, z]} rotation-y={turn}>
      <mesh material={wood} position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.04, 12]} />
      </mesh>
      {[
        [-0.12, -0.12],
        [0.12, -0.12],
        [-0.12, 0.12],
        [0.12, 0.12],
      ].map(([lx, lz]) => (
        <mesh key={`${lx}${lz}`} material={wood} position={[lx, 0.22, lz]}>
          <cylinderGeometry args={[0.014, 0.014, 0.45, 5]} />
        </mesh>
      ))}
      <mesh material={wood} position={[0, 0.72, -0.17]}>
        <torusGeometry args={[0.15, 0.015, 5, 12, Math.PI]} />
      </mesh>
      {[-0.15, 0.15].map((bx) => (
        <mesh key={bx} material={wood} position={[bx, 0.6, -0.17]}>
          <cylinderGeometry args={[0.014, 0.014, 0.28, 5]} />
        </mesh>
      ))}
    </group>
  )
}

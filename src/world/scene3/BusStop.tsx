import { useEffect, useMemo } from 'react'
import { CanvasTexture, MeshBasicMaterial, MeshToonMaterial, NearestFilter, SRGBColorSpace } from 'three'
import { FLYERS } from '../../data/flyers'
import { ramp, toon } from '../materials'
import { WALL_FRONT_Z } from '../Promenade'

// Scene 3's awning: a BEST bus shelter on the promenade, backed against the sea wall.
export const STOP_X = 56
const HALF = 2.4
const BACK_Z = WALL_FRONT_Z + 0.12
const FRONT_Z = 0.45
const ROOF_Y = 2.15

/** Where rain doesn't fall: under the roof. Read by <Rain/>. */
export const SHELTERS = [{ x0: STOP_X - HALF, x1: STOP_X + HALF, z0: BACK_Z - 0.2, z1: FRONT_Z, top: ROOF_Y }]

function canvasMaterial(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, lit = true) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const t = new CanvasTexture(c)
  t.magFilter = t.minFilter = NearestFilter
  t.colorSpace = SRGBColorSpace
  const redraw = () => {
    const g = c.getContext('2d')!
    draw(g)
    t.needsUpdate = true
  }
  redraw()
  const material = lit ? new MeshToonMaterial({ map: t, gradientMap: ramp }) : new MeshBasicMaterial({ map: t })
  return { material, redraw }
}

export function BusStop() {
  const sign = useMemo(
    () =>
      canvasMaterial(128, 24, (g) => {
        g.fillStyle = '#B8302A'
        g.fillRect(0, 0, 128, 24)
        g.fillStyle = '#F7EAD7'
        g.fillRect(2, 2, 124, 1)
        g.fillRect(2, 21, 124, 1)
        g.textBaseline = 'middle'
        g.textAlign = 'center'
        g.font = '11px Silkscreen, monospace'
        g.fillText('BUS STOP', 64, 12)
      }),
    [],
  )
  // the coaching-class flyer, blown up into a poster on the back panel
  const poster = useMemo(() => {
    const f = FLYERS[0]
    return canvasMaterial(48, 64, (g) => {
      g.fillStyle = f.paper
      g.fillRect(0, 0, 48, 64)
      g.fillStyle = f.band
      g.fillRect(0, 0, 48, 14)
      g.fillStyle = f.paper
      g.font = 'bold 7px "Pixelify Sans", monospace'
      g.textBaseline = 'middle'
      g.fillText('SUCCESS', 4, 5)
      g.fillText('CLASSES', 4, 11)
      g.fillStyle = f.ink
      g.font = '6px "Pixelify Sans", monospace'
      g.fillText('IIT-JEE · NEET', 4, 22)
      g.font = 'bold 9px "Pixelify Sans", monospace'
      g.fillText('100%', 4, 34)
      g.fillText('RESULTS*', 4, 43)
      g.font = '5px "Pixelify Sans", monospace'
      g.fillText('*results may vary', 4, 56)
    })
  }, [])
  useEffect(() => {
    document.fonts?.ready.then(() => {
      sign.redraw()
      poster.redraw()
    })
  }, [sign, poster])

  const depth = FRONT_Z - BACK_Z
  return (
    <group position={[STOP_X, 0, 0]}>
      {/* roof, tipped forward, with the red sign along its front */}
      <mesh material={toon('#5A4D6E')} position={[0, ROOF_Y, (BACK_Z + FRONT_Z) / 2]} rotation-x={0.06}>
        <boxGeometry args={[HALF * 2 + 0.3, 0.08, depth + 0.3]} />
      </mesh>
      <mesh material={sign.material} position={[0, ROOF_Y - 0.13, FRONT_Z + 0.16]}>
        <planeGeometry args={[2.4, 0.45]} />
      </mesh>
      {/* posts */}
      {[-HALF, HALF].map((x) =>
        [BACK_Z + 0.05, FRONT_Z].map((z) => (
          <mesh key={`${x}${z}`} material={toon('#3A3048')} position={[x, ROOF_Y / 2, z]}>
            <boxGeometry args={[0.07, ROOF_Y, 0.07]} />
          </mesh>
        )),
      )}
      {/* back panel and its poster */}
      <mesh material={toon('#4A4060')} position={[0, 1.15, BACK_Z]}>
        <boxGeometry args={[HALF * 2, 1.5, 0.05]} />
      </mesh>
      <mesh material={poster.material} position={[1.35, 1.25, BACK_Z + 0.03]}>
        <planeGeometry args={[0.6, 0.8]} />
      </mesh>
      {/* bench */}
      <mesh material={toon('#6A5C80')} position={[-0.3, 0.45, BACK_Z + 0.32]}>
        <boxGeometry args={[3.2, 0.06, 0.38]} />
      </mesh>
      {[-1.7, 1.1].map((x) => (
        <mesh key={x} material={toon('#3A3048')} position={[x, 0.22, BACK_Z + 0.32]}>
          <boxGeometry args={[0.06, 0.44, 0.3]} />
        </mesh>
      ))}
    </group>
  )
}

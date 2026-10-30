import { useEffect, useMemo } from 'react'
import { CanvasTexture, MeshToonMaterial, NearestFilter, SRGBColorSpace } from 'three'
import { SCENES, type Scene } from '../data/scenes'
import { CharLayer } from './characters/shared'
import { ramp, toon } from './materials'

const W = 192
const H = 72

/** A board on a post just before each scene: "SCENE 02 · 8:05 PM — Who's there". */
function board(scene: Scene) {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const t = new CanvasTexture(c)
  t.magFilter = t.minFilter = NearestFilter
  t.colorSpace = SRGBColorSpace
  const draw = () => {
    const g = c.getContext('2d')!
    g.imageSmoothingEnabled = false
    g.fillStyle = '#0A0918'
    g.fillRect(0, 0, W, H)
    g.fillStyle = '#F7EAD7'
    g.fillRect(4, 4, W - 8, H - 8)
    g.fillStyle = '#FF8A4C'
    g.fillRect(4, 4, W - 8, 18)
    g.fillStyle = '#14122B'
    g.textBaseline = 'middle'
    g.font = '11px Silkscreen, monospace'
    g.fillText(`SCENE ${scene.num} · ${scene.time}`, 10, 14)
    g.fillStyle = '#1E1630'
    g.font = 'bold 26px "Pixelify Sans", monospace'
    g.fillText(scene.title, 10, 46)
    t.needsUpdate = true
  }
  draw()
  return { material: new MeshToonMaterial({ map: t, gradientMap: ramp }), draw }
}

export function Signposts() {
  const boards = useMemo(() => SCENES.filter((s) => s.built).map((s) => ({ scene: s, ...board(s) })), [])
  // redraw once the pixel fonts have loaded
  useEffect(() => {
    document.fonts?.ready.then(() => boards.forEach((b) => b.draw()))
  }, [boards])

  return (
    <>
      {boards.map(({ scene, material }) => (
        <CharLayer key={scene.id} position={[scene.x - 7.5, 0, 1.4]}>
          <mesh material={toon('#2A2238')} position={[0, 0.55, 0]}>
            <boxGeometry args={[0.06, 1.1, 0.06]} />
          </mesh>
          <mesh material={material} position={[0, 1.25, 0.04]}>
            <planeGeometry args={[1.2, 0.45]} />
          </mesh>
        </CharLayer>
      ))}
    </>
  )
}

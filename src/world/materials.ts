import { AdditiveBlending, CanvasTexture, Color, DataTexture, MeshBasicMaterial, MeshToonMaterial, NearestFilter, RedFormat } from 'three'

// Three hard light steps: shadow, mid, lit. Gives code-built shapes a hand-shaded look.
export const ramp = new DataTexture(new Uint8Array([70, 160, 255]), 3, 1, RedFormat)
ramp.minFilter = NearestFilter
ramp.magFilter = NearestFilter
ramp.needsUpdate = true

const cache = new Map<string, MeshToonMaterial>()

/** Shared toon material per colour. Don't mutate the result; ask for a new colour instead. */
export function toon(color: string, emissive?: string) {
  const key = `${color}|${emissive ?? ''}`
  let m = cache.get(key)
  if (!m) {
    m = new MeshToonMaterial({ color: new Color(color), gradientMap: ramp })
    if (emissive) m.emissive = new Color(emissive)
    cache.set(key, m)
  }
  return m
}

let glowTex: CanvasTexture | null = null

/** Radial glow in four hard rings, for small lights (lanterns, plane lights). */
export function glowMaterial(color: string) {
  if (!glowTex) {
    const c = document.createElement('canvas')
    c.width = c.height = 16
    const g = c.getContext('2d')!
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const r = Math.hypot(x - 7.5, y - 7.5) / 8
        const a = Math.floor((1 - Math.min(1, r)) * 4) / 4
        g.fillStyle = `rgba(255,255,255,${a * a})`
        g.fillRect(x, y, 1, 1)
      }
    glowTex = new CanvasTexture(c)
    glowTex.magFilter = glowTex.minFilter = NearestFilter
  }
  return new MeshBasicMaterial({
    map: glowTex,
    color: new Color(color),
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
}

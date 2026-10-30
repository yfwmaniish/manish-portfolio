import { ART, type Frame, type Who } from './art'

// Turns a vector portrait into pixel art: draw it at 120×150, snap every pixel to the
// drawing's own colours (no anti-aliased in-betweens), then add a 1px dark outline.

export const PORTRAIT_W = 120
export const PORTRAIT_H = 150
const OUTLINE: [number, number, number] = [10, 9, 24]

const cache = new Map<string, Promise<HTMLCanvasElement>>()

const key = (who: Who, f: Frame) => `${who}|${f.mood}|${f.blink ? 1 : 0}|${f.talk ? 1 : 0}`

function paletteOf(svgText: string) {
  const hex = new Set(svgText.match(/#[0-9a-fA-F]{6}/g) ?? [])
  return [...hex].map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)] as const)
}

async function render(who: Who, f: Frame) {
  const text = ART[who](f)
  const img = new Image()
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`
  await img.decode()

  const canvas = document.createElement('canvas')
  canvas.width = PORTRAIT_W
  canvas.height = PORTRAIT_H
  const g = canvas.getContext('2d', { willReadFrequently: true })!
  g.drawImage(img, 0, 0, PORTRAIT_W, PORTRAIT_H)
  const data = g.getImageData(0, 0, PORTRAIT_W, PORTRAIT_H)
  const px = data.data
  const pal = paletteOf(text)

  // snap colours, harden alpha
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 128) {
      px[i + 3] = 0
      continue
    }
    let best = 0
    let bestD = Infinity
    for (let k = 0; k < pal.length; k++) {
      const dr = px[i] - pal[k][0]
      const dg = px[i + 1] - pal[k][1]
      const db = px[i + 2] - pal[k][2]
      const d = dr * dr + dg * dg + db * db
      if (d < bestD) {
        bestD = d
        best = k
      }
    }
    px[i] = pal[best][0]
    px[i + 1] = pal[best][1]
    px[i + 2] = pal[best][2]
    px[i + 3] = 255
  }

  // outline: any empty pixel touching the figure (not along the bottom edge)
  const solid = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < PORTRAIT_W && y < PORTRAIT_H && px[(y * PORTRAIT_W + x) * 4 + 3] === 255
  const edge: number[] = []
  for (let y = 0; y < PORTRAIT_H; y++)
    for (let x = 0; x < PORTRAIT_W; x++)
      if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) edge.push((y * PORTRAIT_W + x) * 4)
  for (const i of edge) {
    px[i] = OUTLINE[0]
    px[i + 1] = OUTLINE[1]
    px[i + 2] = OUTLINE[2]
    px[i + 3] = 255
  }

  g.putImageData(data, 0, 0)
  return canvas
}

/** The pixel-art frame for this character, mood, blink and mouth. Cached. */
export function portraitFrame(who: Who, f: Frame) {
  const k = key(who, f)
  let p = cache.get(k)
  if (!p) {
    p = render(who, f)
    cache.set(k, p)
  }
  return p
}

/** Render every frame up front so the first line of dialogue never waits. */
export function warmPortraits(moods: Record<Who, string[]>) {
  for (const who of Object.keys(moods) as Who[])
    for (const mood of moods[who])
      for (const blink of [false, true])
        for (const talk of [false, true]) portraitFrame(who, { mood: mood as Frame['mood'], blink, talk })
}

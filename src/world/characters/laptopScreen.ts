import { CanvasTexture, NearestFilter, SRGBColorSpace } from 'three'

// Manish's laptop screen, drawn as tiny pixel art and redrawn while he types.
export const SCREEN_W = 48
export const SCREEN_H = 30

const BG = '#14122B'
const SYNTAX = ['#FF8A4C', '#7FD1C7', '#FFC56B', '#C9B8D6', '#F28FB3', '#9ED9B0']

const GLYPHS: Record<string, string[]> = {
  A: ['.X.', 'X.X', 'XXX', 'X.X', 'X.X'],
  N: ['XX.', 'X.X', 'X.X', 'X.X', 'X.X'],
  S: ['XXX', 'X..', 'XXX', '..X', 'XXX'],
  T: ['XXX', '.X.', '.X.', '.X.', '.X.'],
  V: ['X.X', 'X.X', 'X.X', 'X.X', '.X.'],
  M: ['X.X', 'XXX', 'XXX', 'X.X', 'X.X'],
  C: ['XXX', 'X..', 'X..', 'X..', 'XXX'],
  D: ['XX.', 'X.X', 'X.X', 'X.X', 'XX.'],
  '?': ['XXX', '..X', '.XX', '...', '.X.'],
}

export interface ScreenSplash {
  title: string
  color: string
}

/** A code editor whose lines fill in as he types; or a project splash when he shows you something. */
export function makeLaptopScreen() {
  const canvas = document.createElement('canvas')
  canvas.width = SCREEN_W
  canvas.height = SCREEN_H
  const g = canvas.getContext('2d')!
  const texture = new CanvasTexture(canvas)
  texture.magFilter = texture.minFilter = NearestFilter
  texture.colorSpace = SRGBColorSpace

  // A pseudo-random but stable program: indent, then a few coloured tokens per line.
  let seed = 3
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  const lines = Array.from({ length: 40 }, () => {
    const indent = Math.floor(rnd() * 3) * 3
    const tokens: [number, string][] = []
    let w = 0
    const n = 1 + Math.floor(rnd() * 4)
    for (let i = 0; i < n; i++) {
      const len = 2 + Math.floor(rnd() * 7)
      tokens.push([len, SYNTAX[Math.floor(rnd() * SYNTAX.length)]])
      w += len + 1
    }
    return { indent, tokens, width: w }
  })

  let typed = 0

  function drawCode() {
    g.fillStyle = BG
    g.fillRect(0, 0, SCREEN_W, SCREEN_H)
    // title bar and gutter
    g.fillStyle = '#2A1F45'
    g.fillRect(0, 0, SCREEN_W, 3)
    g.fillStyle = '#E04848'
    g.fillRect(1, 1, 1, 1)
    g.fillStyle = '#E7C55A'
    g.fillRect(3, 1, 1, 1)
    g.fillStyle = '#9ED9B0'
    g.fillRect(5, 1, 1, 1)
    g.fillStyle = '#1D1838'
    g.fillRect(0, 3, 4, SCREEN_H - 3)

    // show the last rows that fit, the newest one partly typed
    const rows = Math.floor((SCREEN_H - 5) / 2)
    const charsPerLine = lines.map((l) => l.indent + l.width)
    let remaining = typed
    let lineIdx = 0
    while (lineIdx < lines.length - 1 && remaining > charsPerLine[lineIdx]) remaining -= charsPerLine[lineIdx++]
    const first = Math.max(0, lineIdx - rows + 1)
    for (let r = 0; r <= lineIdx - first; r++) {
      const li = first + r
      const L = lines[li]
      const y = 5 + r * 2
      const limit = li === lineIdx ? remaining : Infinity
      let x = 6 + L.indent
      let used = L.indent
      for (const [len, color] of L.tokens) {
        const draw = Math.min(len, limit - used)
        if (draw <= 0) break
        g.fillStyle = color
        g.fillRect(x, y, draw, 1)
        x += len + 1
        used += len + 1
      }
      if (li === lineIdx) {
        g.fillStyle = '#F7EAD7'
        g.fillRect(Math.min(SCREEN_W - 2, 6 + L.indent + Math.max(0, remaining)), y - 1, 1, 2)
      }
    }
  }

  function drawSplash(s: ScreenSplash) {
    g.fillStyle = BG
    g.fillRect(0, 0, SCREEN_W, SCREEN_H)
    g.fillStyle = s.color
    g.fillRect(4, 4, SCREEN_W - 8, 12)
    // the project's initial, 3×5 pixels drawn at 2×
    const glyph = GLYPHS[s.title[0].toUpperCase()] ?? GLYPHS['?']
    g.fillStyle = BG
    glyph.forEach((row, y) => [...row].forEach((p, x) => p === 'X' && g.fillRect(8 + x * 2, 5 + y * 2, 2, 2)))
    g.fillRect(17, 13, 20, 1)
    g.fillStyle = '#C9B8D6'
    for (const [y, w] of [[19, 34], [22, 28], [25, 31]]) g.fillRect(4, y, w, 1)
  }

  drawCode()

  return {
    texture,
    /** Advance the typing by one keystroke. */
    type() {
      typed = (typed + 1) % 600
      drawCode()
      texture.needsUpdate = true
    },
    show(s: ScreenSplash | null) {
      if (s) drawSplash(s)
      else drawCode()
      texture.needsUpdate = true
    },
  }
}

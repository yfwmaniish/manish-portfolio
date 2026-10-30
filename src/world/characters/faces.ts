import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, MeshToonMaterial, NearestFilter, SRGBColorSpace } from 'three'
import type { Mood, Who } from '../../portraits/art'
import { useStore } from '../../store/useStore'
import { ramp } from '../materials'

// Tiny pixel faces painted onto the 3D heads (16×14), with the same expressions as
// the portraits so the world and the dialogue agree.

type Face = { mood: Mood; blink: boolean; talk: boolean }
const W = 16
const H = 14

const COLORS: Record<string, string> = {
  k: '#1A1020', // lashes, brows
  w: '#F7EAD7',
  i: '#3A2018', // iris
  m: '#6E2E2A', // mouth
  s: '#2A2028', // moustache
  g: '#6A6070', // grey brows
  b: '#22171E', // beard
}

function grid() {
  return Array.from({ length: H }, () => Array<string>(W).fill('.'))
}
function paint(g: string[][], row: number, col: number, s: string) {
  ;[...s].forEach((c, k) => c !== ' ' && (g[row][col + k] = c))
}
/** Paint the same feature on both sides of the face. */
function pair(g: string[][], row: number, col: number, s: string) {
  paint(g, row, col, s)
  paint(g, row, W - col - s.length, [...s].reverse().join(''))
}

function aliFace(f: Face) {
  const g = grid()
  const up = f.mood === 'surprised' ? -1 : 0
  pair(g, 2 + up, 2, 'kkk')
  if (f.mood === 'smug') paint(g, 1, 11, 'kkk') // one brow up
  if (f.blink) pair(g, 6, 2, 'kkkk')
  else if (f.mood === 'smug') {
    pair(g, 5, 2, 'kkkk')
    pair(g, 6, 2, 'wiiw')
  } else {
    pair(g, 4 + up, 2, 'kkkk')
    pair(g, 5 + up, 2, 'wiiw')
    if (f.mood !== 'smile') pair(g, 6 + up, 2, 'wiiw')
    if (f.mood === 'surprised') pair(g, 6, 2, 'wiiw')
  }
  // short full beard: down the cheeks, round the chin, a moustache
  for (let r = 7; r <= 12; r++) pair(g, r, 0, r < 9 ? 'b' : 'bb')
  pair(g, 10, 2, 'bbb')
  pair(g, 11, 2, 'bbbb')
  paint(g, 12, 2, 'bbbbbbbbbbbb')
  paint(g, 13, 4, 'bbbbbbbb')
  paint(g, 9, 4, 'bbbbbbbb')
  if (f.talk) {
    paint(g, 10, 6, 'wwww')
    paint(g, 11, 6, 'mmmm')
  } else if (f.mood === 'smile') {
    paint(g, 10, 5, 'm    m')
    paint(g, 11, 6, 'mmmm')
  } else if (f.mood === 'smug') {
    paint(g, 10, 10, 'm')
    paint(g, 11, 7, 'mmm')
  } else if (f.mood === 'surprised') {
    paint(g, 10, 7, 'mm')
    paint(g, 11, 7, 'mm')
  } else paint(g, 11, 6, 'mmmm')
  return g
}

function vendorFace(f: Face) {
  const g = grid()
  const up = f.mood === 'surprised' ? -1 : 0
  pair(g, 3 + up, 2, 'gggg')
  if (f.blink || f.mood === 'grin') {
    pair(g, 5, 3, 'k  k')
    pair(g, 4, 4, 'kk')
  } else {
    pair(g, 5 + up, 3, 'kkk')
    pair(g, 6 + up, 3, 'wiw')
    if (f.mood === 'surprised') pair(g, 6, 3, 'wiw')
  }
  paint(g, 9, 4, 'ssssssss')
  paint(g, 10, 3, f.mood === 'grin' ? 's        s' : 'ss      ss')
  if (f.talk) paint(g, 11, 6, 'mmmm')
  else if (f.mood === 'grin') paint(g, 11, 5, 'wwwwww')
  else if (f.mood === 'surprised') paint(g, 11, 7, 'mm')
  else paint(g, 11, 6, 'mmmm')
  return g
}

/** The balloon wala: kind eyes, a thin moustache. He never talks in the dialogue box. */
function balloonFace(f: Face) {
  const g = grid()
  pair(g, 3, 3, 'kkk')
  if (f.blink) pair(g, 6, 3, 'kkk')
  else {
    pair(g, 5, 3, 'kkk')
    pair(g, 6, 3, 'wiw')
  }
  paint(g, 9, 5, 'ssssss')
  paint(g, 11, 6, f.talk ? 'mmmm' : ' mm ')
  return g
}

type FaceWho = Who | 'Balloon wala'
const DRAW: Partial<Record<FaceWho, (f: Face) => string[][]>> = { Manish: aliFace, 'Chai wala': vendorFace, 'Balloon wala': balloonFace }
const textures = new Map<string, CanvasTexture>()

function faceTexture(who: FaceWho, f: Face) {
  const key = `${who}|${f.mood}|${+f.blink}|${+f.talk}`
  let t = textures.get(key)
  if (t) return t
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  DRAW[who]!(f).forEach((row, y) =>
    row.forEach((ch, x) => {
      if (ch === '.') return
      ctx.fillStyle = COLORS[ch]
      ctx.fillRect(x, y, 1, 1)
    }),
  )
  t = new CanvasTexture(c)
  t.magFilter = t.minFilter = NearestFilter
  t.colorSpace = SRGBColorSpace
  textures.set(key, t)
  return t
}

const CHAR_MS = 26

/**
 * A face material for `who`: neutral and blinking on its own, and while they're the
 * one speaking, it wears the line's expression and moves its mouth until the line
 * has typed out.
 */
export function useFace(who: FaceWho) {
  const material = useMemo(() => new MeshToonMaterial({ gradientMap: ramp, transparent: false, alphaTest: 0.5 }), [])
  const s = useRef({ blink: 2, lineStart: 0, line: -1, current: '' })

  useEffect(() => () => material.dispose(), [material])

  useFrame((state, dt) => {
    const c = s.current
    const d = useStore.getState().dialogue
    const speaking = d?.who === who
    if (d && d.line !== c.line) {
      c.line = d.line
      c.lineStart = state.clock.elapsedTime
    }
    c.blink -= dt
    if (c.blink < -0.13) c.blink = 2 + Math.random() * 3
    const typing = speaking && state.clock.elapsedTime - c.lineStart < (d!.text.length * CHAR_MS) / 1000
    const face: Face = {
      mood: speaking ? (d!.mood as Mood) : 'neutral',
      blink: c.blink < 0,
      talk: typing && Math.floor(state.clock.elapsedTime * 9) % 2 === 0,
    }
    const key = `${face.mood}|${face.blink}|${face.talk}`
    if (key !== c.current) {
      c.current = key
      material.map = faceTexture(who, face)
      material.needsUpdate = true
    }
  })

  return material
}

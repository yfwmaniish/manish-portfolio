import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { sound } from '../../audio/bus'
import { MORSE_LAMP_X } from '../../data/places'
import { useAnchor } from '../../engine/anchors'
import { useInteractable } from '../../engine/interactables'
import { useStore } from '../../store/useStore'
import { CharLayer, HitBox } from '../characters/shared'
import { frame, LAYER_FX } from '../frame'
import { glowMaterial, toon } from '../materials'
import { PageSheet } from '../pages/PageSheet'

// On the way to Scene 3: an old cast-iron lamp by the wall that flickers on its own.
// Stand and watch it and the flicker turns out to be Morse code. The first time it
// finishes, a page that was stuck on top of the lantern slides off.

const Z = -1.25
const HEAD_Y = 2.25
const DOT = 0.2
const MORSE: Record<string, string> = { A: '.-', E: '.', H: '....', I: '..', L: '.-..', R: '.-.' }
// What it says each time you watch. DRAFT, Ali to approve.
const MESSAGES = ['HI', 'ALI', 'HIRE ALI']
const ENDINGS = ['(It blinked: HI.)', '(It blinked: ALI.)', '(It blinked: HIRE ALI. Very subtle.)']

/** On/off times for a message, in seconds from the start. */
function schedule(text: string) {
  const on: [number, number, string][] = []
  let t = 0.6
  for (const word of text.split(' ')) {
    for (const ch of word) {
      for (const sym of MORSE[ch]) {
        const len = sym === '.' ? DOT : DOT * 3
        on.push([t, t + len, sym])
        t += len + DOT
      }
      t += DOT * 2
    }
    t += DOT * 4
  }
  return { on, end: t }
}

export function MorseLamp() {
  const found = useStore((s) => s.pagesFound.includes('sentiment'))
  const [dropped, setDropped] = useState(false)
  const bulb = useRef<MeshBasicMaterial>(null)
  const halo = useMemo(() => glowMaterial('#FFC56B'), [])
  const colors = useMemo(() => ({ off: new Color('#3A3048'), on: new Color('#FFE3A8') }), [])
  const glowMesh = useRef<Mesh>(null)
  const s = useRef({ startedAt: -100, msg: 0, plan: schedule('HI'), lastSym: -1, typed: '' })
  const at = useMemo(() => new Vector3(MORSE_LAMP_X, HEAD_Y + 0.5, Z), [])
  useAnchor('say-lamp', () => at)

  const watching = () => frame.time - s.current.startedAt < s.current.plan.end

  const handlers = useInteractable({
    id: 'morse-lamp',
    label: 'Watch the flickering lamp',
    x: () => MORSE_LAMP_X,
    onActivate: () => {
      const c = s.current
      if (watching()) return
      c.plan = schedule(MESSAGES[c.msg % MESSAGES.length])
      c.startedAt = frame.time
      c.lastSym = -1
      c.typed = ''
    },
  })

  useFrame(() => {
    const c = s.current
    const t = frame.time
    const since = t - c.startedAt
    let lit: boolean
    if (since < c.plan.end) {
      const k = c.plan.on.findIndex(([a, b]) => since >= a && since < b)
      lit = k >= 0
      if (k > c.lastSym) {
        c.lastSym = k
        c.typed += c.plan.on[k][2] === '.' ? '·' : '–'
        sound('buzz', { x: MORSE_LAMP_X })
        useStore.getState().say('lamp', c.typed, 1500)
      }
    } else {
      if (c.lastSym >= 0) {
        // message over: say what it spelled, and the first time, drop the page
        useStore.getState().say('lamp', ENDINGS[c.msg % ENDINGS.length], 3000)
        c.msg++
        c.lastSym = -1
        if (!found && !dropped) setDropped(true)
      }
      // left alone it flickers now and then, like old lamps do
      const night = frame.tod.lights
      const flicker = Math.sin(t * 7.3) * Math.sin(t * 2.1) > 0.82
      lit = night > 0.3 && !flicker
    }
    bulb.current?.color.copy(lit ? colors.on : colors.off)
    halo.opacity = lit ? 0.75 : 0
    if (glowMesh.current) glowMesh.current.visible = lit
  })

  return (
    <group>
      <group position={[MORSE_LAMP_X, 0, Z]}>
        <CharLayer>
          {/* a stepped base, a fluted post, a four-sided glass lantern on top */}
          <mesh material={toon('#2A2238')} position={[0, 0.12, 0]}>
            <boxGeometry args={[0.32, 0.24, 0.32]} />
          </mesh>
          <mesh material={toon('#2A2238')} position={[0, 1.15, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 1.9, 6]} />
          </mesh>
          <mesh material={toon('#2A2238')} position={[0, HEAD_Y - 0.17, 0]}>
            <boxGeometry args={[0.22, 0.04, 0.22]} />
          </mesh>
          <mesh position={[0, HEAD_Y, 0]}>
            <boxGeometry args={[0.18, 0.28, 0.18]} />
            <meshBasicMaterial ref={bulb} color="#3A3048" />
          </mesh>
          <mesh material={toon('#2A2238')} position={[0, HEAD_Y + 0.2, 0]}>
            <coneGeometry args={[0.17, 0.14, 4]} />
          </mesh>
        </CharLayer>
        <mesh ref={glowMesh} material={halo} position={[0, HEAD_Y, 0.15]} layers={LAYER_FX}>
          <planeGeometry args={[1.3, 1.3]} />
        </mesh>
        <HitBox size={[0.6, 2.7, 0.6]} position={[0, 1.35, 0]} {...handlers} />
      </group>
      <PageSheet id="sentiment" x={MORSE_LAMP_X + 0.6} z={Z + 0.7} show={dropped || found} from={[MORSE_LAMP_X, HEAD_Y + 0.3, Z]} />
    </group>
  )
}

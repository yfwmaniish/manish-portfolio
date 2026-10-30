import { Biquad, finish, loopify, rng, secs, SR, type Buf } from './dsp'

// Soft lo-fi keys under the city, after Until Then: a warm electric piano playing
// four slow chords, a quiet bass, a few melody notes, and a little vinyl crackle.
// One loop for dusk, one for the night, one for dawn; the mixer crossfades them by
// the time of night. Everything is generated here, like the rest of the sound.

const CHORD_S = 4
const FADE = 1.5

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

/** A sine oscillator stepped by rotation: no Math.sin per sample. */
function osc(f: number) {
  const w = (2 * Math.PI * f) / SR
  return { c: Math.cos(w), s: Math.sin(w), x: 1, y: 0 }
}
function tick(o: { c: number; s: number; x: number; y: number }) {
  const x = o.x * o.c - o.y * o.s
  o.y = o.x * o.s + o.y * o.c
  o.x = x
  return o.y
}

/** An electric-piano note: soft attack, slow fade, a bell tone on top, gentle tremolo. */
function key(out: Buf, at: number, midi: number, gain: number, len = CHORD_S + 1) {
  const f = hz(midi)
  const o = secs(at)
  const n = Math.min(secs(len), out.length - o)
  const p1 = osc(f)
  const p2 = osc(f * 2)
  const p3 = osc(f * 3)
  const trem = osc(4.2)
  const fade = Math.exp(-1 / (SR * 2.4))
  const ping = Math.exp(-1 / (SR * 0.25))
  const attack = secs(0.02)
  let env = 1
  let bell = 0.12
  for (let i = 0; i < n; i++) {
    env *= fade
    bell *= ping
    const tone = tick(p1) + 0.22 * tick(p2) + bell * tick(p3)
    out[o + i] += tone * env * Math.min(1, i / attack) * gain * (1 + 0.12 * tick(trem))
  }
}

interface Mood {
  /** Four chords, low to high (MIDI), and each one's bass root. */
  chords: { notes: number[]; root: number }[]
  seed: number
}

function render({ chords, seed }: Mood): Buf {
  const r = rng(seed)
  const out = new Float32Array(secs(chords.length * CHORD_S + FADE))
  chords.forEach(({ notes, root }, c) => {
    const at = c * CHORD_S
    // a lazy strum, low to high
    notes.forEach((m, k) => key(out, at + k * 0.035, m, 0.16))
    key(out, at, root - 12, 0.22, CHORD_S + 0.5)
    // two or three melody notes from the chord, an octave up, never on the beat
    const count = 2 + Math.floor(r() * 2)
    for (let k = 0; k < count; k++) {
      const m = notes[Math.floor(r() * notes.length)] + 12
      key(out, at + 0.6 + k * (1.1 + r() * 0.3), m, 0.09, 2.5)
    }
  })
  // vinyl: a faint hiss and the odd crackle
  for (let i = 0; i < out.length; i++) {
    out[i] += (r() * 2 - 1) * 0.004
    if (r() < 0.00025) out[i] += (r() * 2 - 1) * 0.12
  }
  // muffle it, like it's coming from a radio in the next room
  const lp = new Biquad('lowpass', 2200)
  for (let i = 0; i < out.length; i++) out[i] = lp.run(out[i])
  return finish(loopify(out, FADE), 0.9, false)
}

/** Warm and a little wistful: the sun going down. */
export const musicDusk = () =>
  render({
    seed: 101,
    chords: [
      { notes: [53, 57, 60, 64], root: 41 }, // Fmaj7
      { notes: [52, 55, 59, 62], root: 40 }, // Em7
      { notes: [50, 53, 57, 60], root: 38 }, // Dm7
      { notes: [48, 52, 55, 59], root: 36 }, // Cmaj7
    ],
  })

/** Slow and quiet: the city asleep, the rain, the stars. */
export const musicNight = () =>
  render({
    seed: 202,
    chords: [
      { notes: [57, 60, 64, 67], root: 45 }, // Am7
      { notes: [53, 57, 60, 64], root: 41 }, // Fmaj7
      { notes: [52, 55, 59, 60], root: 48 }, // Cmaj7
      { notes: [55, 59, 62, 64], root: 43 }, // G6
    ],
  })

/** Lifting: first light over the sea. */
export const musicDawn = () =>
  render({
    seed: 303,
    chords: [
      { notes: [48, 52, 55, 59], root: 36 }, // Cmaj7
      { notes: [53, 57, 60, 64], root: 41 }, // Fmaj7
      { notes: [57, 60, 64, 67], root: 45 }, // Am7
      { notes: [55, 59, 62, 67], root: 43 }, // G
    ],
  })

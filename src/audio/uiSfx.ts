import { Biquad, filter, finish, hit, mixAt, noise, rng, secs, SR, type Buf } from './dsp'

// Interface sounds: small, round and soft, like the clicks of an old handheld.

function render(seconds: number, fn: (out: Buf, t: (i: number) => number) => void, peak = 0.6): Buf {
  const out = new Float32Array(secs(seconds))
  fn(out, (i) => i / SR)
  return finish(out, peak)
}

/** A rounded square-wave note: the basic "game" voice. */
function note(out: Buf, at: number, f: number, len: number, decay: number) {
  const lp = new Biquad('lowpass', f * 3)
  const o = secs(at)
  for (let i = 0; i < secs(len) && o + i < out.length; i++) {
    const s = i / SR
    out[o + i] += lp.run(Math.sign(Math.sin(2 * Math.PI * f * s))) * hit(s, 0.003, decay)
  }
}

/** Text ticking onto the dialogue box, a few letters at a time. Pitched per speaker. */
export const tick = () =>
  render(0.035, (out, t) => {
    for (let i = 0; i < out.length; i++) out[i] = Math.sin(2 * Math.PI * 620 * t(i)) * hit(t(i), 0.002, 0.01)
  })

/** Clicking on to the next line: a crisp little tk. */
export const click = () =>
  render(0.05, (out) => {
    note(out, 0, 1180, 0.05, 0.012)
    const body = new Float32Array(secs(0.03))
    for (let i = 0; i < body.length; i++) body[i] = Math.sin(2 * Math.PI * 220 * (i / SR)) * hit(i / SR, 0.001, 0.008)
    mixAt(out, body, 0, 0.6)
  })

/** Picking a choice: two quick notes, up. */
export const select = () =>
  render(0.16, (out) => {
    note(out, 0, 660, 0.07, 0.03)
    note(out, 0.06, 990, 0.1, 0.04)
  })

/** Walking away from a conversation: two notes, down. */
export const back = () =>
  render(0.16, (out) => {
    note(out, 0, 660, 0.07, 0.03)
    note(out, 0.06, 440, 0.1, 0.04)
  })

/** The cursor finding something you can click: the faintest tick. */
export const hover = () =>
  render(0.03, (out, t) => {
    for (let i = 0; i < out.length; i++) out[i] = Math.sin(2 * Math.PI * 1500 * t(i)) * hit(t(i), 0.001, 0.006)
  })

/** The phone sliding up: two rising notes. */
export const phone = () =>
  render(0.2, (out, t) => {
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      out[i] = Math.sin(2 * Math.PI * (s < 0.08 ? 523 : 784) * s) * hit(s % 0.08, 0.004, 0.04)
    }
  })

/** Putting it away: the same two notes, falling. */
export const phoneClose = () =>
  render(0.2, (out, t) => {
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      out[i] = Math.sin(2 * Math.PI * (s < 0.08 ? 784 : 523) * s) * hit(s % 0.08, 0.004, 0.04)
    }
  })

/** Tapping an app or a button on the phone. */
export const tap = () =>
  render(0.05, (out, t) => {
    for (let i = 0; i < out.length; i++) out[i] = Math.sin(2 * Math.PI * 880 * t(i)) * hit(t(i), 0.002, 0.012)
  })

/** A message arriving: a bubbly bloop. */
export const message = () =>
  render(0.16, (out, t) => {
    let ph = 0
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      ph += (480 + 520 * Math.min(1, s / 0.07)) / SR
      out[i] = Math.sin(2 * Math.PI * ph) * hit(s, 0.005, 0.05)
    }
  })

/** Sending one: a quick swoosh up. */
export const send = () =>
  render(0.14, (out, t) => {
    const n = noise(out.length, 40)
    const bp = new Biquad('bandpass', 900, 1.2)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      if (i % 32 === 0) bp.set(900 + 2000 * (s / 0.14), 1.2)
      out[i] = bp.run(n[i]) * Math.sin((Math.PI * s) / 0.14)
    }
  })

/** A notebook page turning: the sweep of paper, a crinkle as it lands. */
export const page = () =>
  render(0.4, (out, t) => {
    const n = noise(out.length, 41)
    const bp = new Biquad('bandpass', 600, 0.8)
    const crackle = filter(noise(out.length, 42), 'bandpass', 3000, 1)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      if (i % 64 === 0) bp.set(500 + 1600 * Math.sin((Math.PI * s) / 0.4), 0.8)
      out[i] = bp.run(n[i]) * Math.sin((Math.PI * s) / 0.4) ** 1.5 + crackle[i] * 0.4 * hit(s - 0.3, 0.002, 0.03)
    }
  })

/** A photo pulled from the pile: a slide and a soft tap as it settles. */
export const photo = () =>
  render(0.3, (out, t) => {
    const n = noise(out.length, 43)
    const bp = new Biquad('bandpass', 1500, 0.7)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      out[i] = bp.run(n[i]) * (s < 0.2 ? Math.sin((Math.PI * s) / 0.2) : 0) * 0.8 + n[i] * 0.4 * hit(s - 0.22, 0.001, 0.01)
    }
  })

/** Stars coming out: a few soft bell notes on a pentatonic scale. */
export const twinkle = () =>
  render(1.6, (out) => {
    const r = rng(44)
    const scale = [784, 880, 1047, 1175, 1319, 1568]
    for (let k = 0; k < 5; k++) {
      const f = scale[Math.floor(r() * scale.length)]
      const bell = new Float32Array(secs(1))
      for (let i = 0; i < bell.length; i++) {
        const s = i / SR
        bell[i] = (Math.sin(2 * Math.PI * f * s) + 0.25 * Math.sin(2 * Math.PI * f * 2.76 * s)) * hit(s, 0.004, 0.3)
      }
      mixAt(out, bell, k * 0.13 + r() * 0.05, 0.5 + r() * 0.4)
    }
  })

/** A moment found: a small bell arpeggio. */
export const chime = () =>
  render(1.1, (out) => {
    ;[523, 659, 784].forEach((f, k) => {
      const bell = new Float32Array(secs(0.8))
      for (let i = 0; i < bell.length; i++) {
        const s = i / SR
        bell[i] = (Math.sin(2 * Math.PI * f * s) + 0.3 * Math.sin(2 * Math.PI * f * 2.76 * s)) * hit(s, 0.003, 0.22)
      }
      mixAt(out, bell, k * 0.09, 0.8)
    })
  })

/** The ending: a warm chord swelling up like the sun, and fading. */
export const swell = () =>
  render(6, (out, t) => {
    const lp = new Biquad('lowpass', 1400)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      const env = s < 2 ? (s / 2) ** 2 : Math.exp(-(s - 2) / 1.4)
      // F major 7, low and wide
      const v = [174.6, 220, 261.6, 329.6, 349.2].reduce((a, f, k) => a + Math.sin(2 * Math.PI * f * s * (1 + (k - 2) * 0.0015)), 0)
      out[i] = lp.run(v) * env
    }
  })

/** A new chapter: one soft, low chord, like a page turning in a storybook. */
export const sting = () =>
  render(2.4, (out, t) => {
    const lp = new Biquad('lowpass', 1600)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      const env = Math.min(1, s / 0.04) * Math.exp(-s / 0.8)
      const v = [220, 277.2, 329.6, 440].reduce((a, f, k) => a + Math.sin(2 * Math.PI * f * s) * (k === 3 ? 0.4 : 1), 0)
      out[i] = lp.run(v) * env
    }
  })

/** A page found: two bright notes going up, then a third. */
export const pageFound = () =>
  render(0.9, (out) => {
    ;[784, 988, 1175].forEach((f, k) => {
      const bell = new Float32Array(secs(0.6))
      for (let i = 0; i < bell.length; i++) {
        const s = i / SR
        bell[i] = (Math.sin(2 * Math.PI * f * s) + 0.2 * Math.sin(2 * Math.PI * f * 3 * s)) * hit(s, 0.003, 0.18)
      }
      mixAt(out, bell, k * 0.11, k === 2 ? 1 : 0.7)
    })
  })

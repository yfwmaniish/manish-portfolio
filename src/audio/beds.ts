import { Biquad, bump, filter, finish, loopify, mixAt, noise, rng, secs, SR, type Buf } from './dsp'

// Ambient loops. Each renders a little long, then folds its tail over its head so it
// loops without a seam. The mixer sets their volumes from the time of night.

const FADE = 1.2

function render(seconds: number, fn: (out: Buf) => void): Buf {
  const out = new Float32Array(secs(seconds + FADE))
  fn(out)
  return finish(loopify(out, FADE), 0.9, false)
}

/** Swells rolling onto the tetrapods: a low wash that rises, breaks into hiss, drains away. */
export const sea = () =>
  render(12, (out) => {
    const low = filter(noise(out.length, 1), 'lowpass', 300)
    const hiss = filter(noise(out.length, 2), 'bandpass', 700, 0.7)
    const waves = [0.4, 3.9, 7.6, 10.4, 12.6]
    for (let i = 0; i < out.length; i++) {
      const t = i / SR
      let env = 0
      for (const w of waves) {
        const d = t - w
        // rise for ~1.4s, then a long drain
        env += d < 0 ? Math.exp(-((d / 1.4) ** 2)) : Math.exp(-d / 1.6)
      }
      env = Math.min(env, 1.4)
      out[i] = low[i] * (0.6 + 0.6 * env) + hiss[i] * 0.35 * env * env
    }
  })

/** Marine Drive's road: a low rumble, cars sweeping past, one far-off horn. */
export const traffic = () =>
  render(10, (out) => {
    const rumble = filter(noise(out.length, 3), 'lowpass', 140)
    const pass = filter(noise(out.length, 4), 'bandpass', 420, 0.5)
    const cars = [1.1, 3.4, 4.6, 7.2, 9.3]
    for (let i = 0; i < out.length; i++) {
      const t = i / SR
      let env = 0
      for (const c of cars) env += bump(t, c, 0.8)
      out[i] = rumble[i] * 0.9 + pass[i] * 0.7 * env
    }
    // a distant two-tone horn, mostly lost in the hum
    const horn = new Float32Array(secs(0.45))
    const lp = new Biquad('lowpass', 900)
    for (let i = 0; i < horn.length; i++) {
      const t = i / SR
      const sq = Math.sign(Math.sin(2 * Math.PI * 415 * t)) + Math.sign(Math.sin(2 * Math.PI * 494 * t))
      horn[i] = lp.run(sq) * Math.min(1, t / 0.02, (0.45 - t) / 0.05)
    }
    mixAt(out, horn, 6.1, 0.05)
  })

/** Rain on concrete and on the bus-stop awning. */
export const rain = () =>
  render(8, (out) => {
    const hp = new Biquad('highpass', 500)
    const lp = new Biquad('lowpass', 2800)
    const wash = noise(out.length, 5)
    for (let i = 0; i < out.length; i++) out[i] = lp.run(hp.run(wash[i])) * 0.35
    // drops: tiny bright clicks, and duller taps on the awning
    const r = rng(6)
    const drops = filter(noise(out.length, 7), 'bandpass', 2200, 2)
    const taps = filter(noise(out.length, 8), 'bandpass', 900, 3)
    for (let k = 0; k < 8 * 70; k++) {
      const at = secs(r() * 8)
      const len = secs(0.012)
      const awning = r() < 0.3
      const src = awning ? taps : drops
      const g = (awning ? 1.1 : 0.7) * (0.4 + r() * 0.6)
      for (let i = 0; i < len && at + i < out.length; i++) out[at + i] += src[at + i] * g * Math.exp(-i / (len / 3))
    }
  })

/** Two crickets with different rhythms, small under the sea. */
export const crickets = () =>
  render(8, (out) => {
    const r = rng(9)
    const voices = [
      { f: 3400, every: 0.86, gain: 1 },
      { f: 3800, every: 1.27, gain: 0.6 },
    ]
    for (const v of voices) {
      for (let t = r() * 0.5; t < 8 + FADE; t += v.every * (0.9 + r() * 0.2)) {
        // a chirp is three quick pulses
        for (let p = 0; p < 3; p++) {
          const start = secs(t + p * 0.035)
          const len = secs(0.022)
          for (let i = 0; i < len && start + i < out.length; i++) {
            const e = Math.sin((Math.PI * i) / len)
            out[start + i] += Math.sin((2 * Math.PI * v.f * i) / SR) * e * v.gain
          }
        }
      }
    }
  })

/** Dawn: crows arguing on the wall, small birds waking up. */
export const morning = () =>
  render(10, (out) => {
    const r = rng(10)
    const caw = (at: number, pitch: number) => {
      const len = secs(0.34)
      const bp = new Biquad('bandpass', 1300, 1.4)
      let ph = 0
      for (let i = 0; i < len; i++) {
        const t = i / len
        ph += (pitch * (1 - 0.25 * t)) / SR
        const saw = 2 * (ph % 1) - 1
        const e = Math.sin(Math.PI * Math.min(1, t * 1.6)) ** 0.6 * (1 - t)
        const j = secs(at) + i
        if (j < out.length) out[j] += bp.run(saw) * e * 1.6
      }
    }
    for (const [at, n, pitch] of [[0.6, 3, 520], [4.8, 2, 470], [8.2, 3, 540]] as const)
      for (let k = 0; k < n; k++) caw(at + k * 0.42, pitch * (1 + (r() - 0.5) * 0.06))
    // little birds: quick rising chirps in twos and threes
    for (let t = 0.2; t < 10; t += 0.5 + r() * 1.1) {
      const n = 2 + Math.floor(r() * 2)
      const base = 2800 + r() * 900
      for (let k = 0; k < n; k++) {
        const start = secs(t + k * 0.09)
        const len = secs(0.06)
        let ph = 0
        for (let i = 0; i < len && start + i < out.length; i++) {
          const u = i / len
          ph += (base + 1400 * u) / SR
          out[start + i] += Math.sin(2 * Math.PI * ph) * Math.sin(Math.PI * u) * 0.35
        }
      }
    }
  })

/** Rain drumming on your umbrella's cloth, close over your head. */
export const canopy = () =>
  render(6, (out) => {
    const r = rng(12)
    const taps = filter(noise(out.length, 13), 'bandpass', 700, 2)
    const ticks = filter(noise(out.length, 14), 'bandpass', 1800, 2)
    for (let k = 0; k < 6 * 130; k++) {
      const at = secs(r() * (6 + FADE))
      const len = secs(0.018)
      const hi = r() < 0.25
      const g = 0.4 + r() * 0.6
      for (let i = 0; i < len && at + i < out.length; i++) out[at + i] += (hi ? ticks : taps)[at + i] * g * Math.exp(-i / (len / 4))
    }
  })

/** Ali's laptop: keys in bursts of words, a pause to think, the odd space bar. */
export const typing = () =>
  render(8, (out) => {
    const r = rng(15)
    const key = filter(noise(secs(0.012), 16), 'bandpass', 2600, 1.5)
    const space = filter(noise(secs(0.02), 17), 'bandpass', 900, 1.5)
    const press = (src: Buf, at: number, g: number) => {
      const o = secs(at)
      for (let i = 0; i < src.length && o + i < out.length; i++) out[o + i] += src[i] * g * (1 - i / src.length)
    }
    let t = 0.2
    while (t < 8 + FADE) {
      const word = 3 + Math.floor(r() * 6)
      for (let k = 0; k < word; k++, t += 0.09 + r() * 0.05) press(key, t, 0.5 + r() * 0.5)
      press(space, t, 0.8)
      t += r() < 0.25 ? 0.6 + r() * 0.9 : 0.12
    }
  })

/** Hot coals on the corn seller's grill: soft hiss and little pops. */
export const coals = () =>
  render(6, (out) => {
    const r = rng(18)
    const hiss = filter(noise(out.length, 19), 'bandpass', 1800, 0.8)
    for (let i = 0; i < out.length; i++) out[i] = hiss[i] * 0.12
    const crack = filter(noise(out.length, 20), 'bandpass', 3000, 1.2)
    for (let k = 0; k < 6 * 9; k++) {
      const at = secs(r() * (6 + FADE))
      const len = secs(0.004 + r() * 0.01)
      const g = 0.4 + r() * 0.8
      for (let i = 0; i < len && at + i < out.length; i++) out[at + i] += crack[at + i] * g * (1 - i / len)
    }
  })

/** Marine Drive FM, from the prototype: sea swell from brown noise on a slow LFO, plus a warm drone. */
export const radio = () =>
  render(10, (out) => {
    const r = rng(11)
    const lp = new Biquad('lowpass', 700)
    const dlp = new Biquad('lowpass', 900)
    let last = 0
    for (let i = 0; i < out.length; i++) {
      const t = i / SR
      last = (last + 0.02 * (r() * 2 - 1)) / 1.02
      const swell = 0.35 + 0.28 * Math.sin(2 * Math.PI * 0.1 * t)
      let drone = 0
      ;[110, 164.81, 220, 277.18].forEach((f, k) => {
        const ph = 2 * Math.PI * f * t * (1 + ((k - 1.5) * 4) / 1731)
        drone += k % 2 ? (2 / Math.PI) * Math.asin(Math.sin(ph)) : Math.sin(ph)
      })
      out[i] = lp.run(last * 3.2) * swell + dlp.run(drone) * 0.028 * 4
    }
  })

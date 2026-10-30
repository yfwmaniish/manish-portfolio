import { Biquad, bump, filter, finish, hit, mixAt, noise, rng, secs, SR, type Buf } from './dsp'

// One-shot sounds for the things you touch. Each is a small recipe: noise or a few
// oscillators, shaped by an envelope.

function render(seconds: number, fn: (out: Buf, t: (i: number) => number) => void, peak = 0.9): Buf {
  const out = new Float32Array(secs(seconds))
  fn(out, (i) => i / SR)
  return finish(out, peak)
}

/** A sandal on the promenade: a soft scuff and a low thump. */
export const step = () =>
  render(0.14, (out, t) => {
    const scuff = filter(noise(out.length, 20), 'lowpass', 1100)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      out[i] = scuff[i] * hit(s, 0.004, 0.03) + Math.sin(2 * Math.PI * 85 * s) * hit(s, 0.002, 0.025) * 0.8
    }
  })

/** Chai from a height: a stream that rises in pitch as the glass fills. */
export const pour = () =>
  render(1.7, (out, t) => {
    const src = noise(out.length, 21)
    const bp = new Biquad('bandpass', 600, 4)
    const r = rng(22)
    let wobble = 0
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      if (i % 64 === 0) {
        wobble = 0.7 + r() * 0.6
        bp.set(550 + 900 * (s / 1.7) ** 1.3, 5)
      }
      const env = Math.min(1, s / 0.08) * Math.min(1, (1.7 - s) / 0.25)
      out[i] = bp.run(src[i]) * env * wobble
    }
  })

/** Coins on the cart: two bright, inharmonic clinks. */
export const coin = () =>
  render(0.7, (out) => {
    const ring = new Float32Array(secs(0.5))
    for (let i = 0; i < ring.length; i++) {
      const s = i / SR
      ring[i] = [2400, 3610, 5230].reduce((a, f, k) => a + Math.sin(2 * Math.PI * f * s) * Math.exp(-s / (0.16 - k * 0.04)), 0)
    }
    mixAt(out, ring, 0)
    mixAt(out, ring, 0.13, 0.7)
  })

/** A phone camera shutter: two quick clicks. */
export const shutter = () =>
  render(0.2, (out, t) => {
    const n = filter(noise(out.length, 23), 'highpass', 1800)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      out[i] = n[i] * (hit(s, 0.001, 0.008) + 0.8 * hit(s - 0.085, 0.001, 0.012))
    }
  })

/** The cop's whistle: a shrill tone with the pea rattling inside. */
export const whistle = () =>
  render(0.75, (out, t) => {
    const breath = filter(noise(out.length, 24), 'bandpass', 2800, 1.5)
    let ph = 0
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      ph += (2300 + 120 * Math.sin(2 * Math.PI * 32 * s)) / SR
      const env = Math.min(1, s / 0.03) * Math.min(1, (0.75 - s) / 0.08)
      out[i] = (Math.sin(2 * Math.PI * ph) + breath[i] * 0.5) * env
    }
  }, 0.7)

/** A cat purring: a low rumble pulsing 25 times a second, breathing in and out. */
/** A happy dog panting: quick breathy huffs, in and out. (Named purr for the template.) */
export const purr = () =>
  render(1.6, (out, t) => {
    const n = filter(noise(out.length, 25), 'bandpass', 1500, 0.8)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      const pant = Math.max(0, Math.sin(2 * Math.PI * 4.2 * s)) ** 3
      const fade = Math.min(1, s / 0.1) * Math.min(1, (1.6 - s) / 0.3)
      out[i] = n[i] * pant * fade
    }
  })

/** A local train far off: two long horn blasts with a little echo off the towers. */
export const trainHorn = () =>
  render(3.4, (out, t) => {
    const lp = new Biquad('lowpass', 1100)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      const on = (s > 0.05 && s < 1.5) || (s > 1.75 && s < 2.3)
      let v = 0
      if (on) for (const f of [311, 370]) for (let h = 1; h <= 5; h++) v += Math.sin(2 * Math.PI * f * h * s) / h
      out[i] = lp.run(v)
    }
    // soften the blasts' edges, then a single echo
    const smooth = filter(out, 'lowpass', 600)
    const d = secs(0.21)
    for (let i = 0; i < out.length; i++) out[i] = smooth[i] + (i >= d ? out[i - d] * 0.35 : 0)
  }, 0.8)

/** Footsteps on wet stone: the scuff, plus a small splash. */
export const splash = () =>
  render(0.22, (out, t) => {
    const wet = filter(noise(out.length, 26), 'bandpass', 1400, 0.8)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      out[i] = wet[i] * hit(s, 0.006, 0.05) + Math.sin(2 * Math.PI * 80 * s) * hit(s, 0.002, 0.02) * 0.5
    }
  })

/** The cat's "mrrp": a little trill that rises, then settles. */
/** A soft, friendly "boof" from the indie. (Named meow for the template.) */
export const meow = () =>
  render(0.3, (out, t) => {
    const lp = new Biquad('lowpass', 900, 1.1)
    const n = filter(noise(out.length, 31), 'bandpass', 700, 1)
    let ph = 0
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      const f = 230 - 90 * Math.min(1, s / 0.2)
      ph += f / SR
      const saw = 2 * (ph % 1) - 1
      const env = Math.min(1, s / 0.012) * Math.exp(-s / 0.07)
      out[i] = (lp.run(saw) * 0.8 + n[i] * 0.5 * Math.exp(-s / 0.03)) * env
    }
  })

/** Paper crinkling: a flurry of tiny crackles that thins out. */
export const paper = () =>
  render(0.45, (out) => {
    const r = rng(27)
    const crackle = filter(noise(out.length, 28), 'bandpass', 2600, 0.9)
    for (let k = 0; k < 70; k++) {
      const at = Math.floor(out.length * r() ** 1.8)
      const len = secs(0.004 + r() * 0.01)
      const g = 0.3 + r()
      for (let i = 0; i < len && at + i < out.length; i++) out[at + i] += crackle[at + i] * g * (1 - i / len)
    }
  }, 0.7)

/** A sheet or card sliding: a soft swoosh. */
export const paperSlide = () =>
  render(0.28, (out, t) => {
    const n = noise(out.length, 29)
    const bp = new Biquad('bandpass', 800, 0.8)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      if (i % 64 === 0) bp.set(700 + 1200 * (s / 0.28), 0.8)
      out[i] = bp.run(n[i]) * Math.sin((Math.PI * s) / 0.28) ** 2
    }
  }, 0.6)

/** A balloon let go: a rubbery squeak at the knot, then air rushing past as it rises. */
export const balloon = () =>
  render(0.9, (out, t) => {
    const air = noise(out.length, 30)
    const bp = new Biquad('bandpass', 500, 1)
    let ph = 0
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      ph += (950 + 300 * (s / 0.14) + 40 * Math.sin(2 * Math.PI * 45 * s)) / SR
      const squeak = s < 0.14 ? Math.sin(2 * Math.PI * ph) * Math.sin((Math.PI * s) / 0.14) * 0.6 : 0
      if (i % 64 === 0) bp.set(400 + 900 * s, 1)
      out[i] = squeak + bp.run(air[i]) * bump(s, 0.45, 0.22) * 0.8
    }
  }, 0.6)

/** A crow, startled: one caw and a few heavy wingbeats. */
export const caw = () =>
  render(0.8, (out, t) => {
    const bp = new Biquad('bandpass', 1250, 1.4)
    const wings = filter(noise(out.length, 31), 'lowpass', 500)
    let ph = 0
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      let v = 0
      if (s < 0.32) {
        ph += (500 * (1 - 0.2 * (s / 0.32))) / SR
        v = bp.run(2 * (ph % 1) - 1) * Math.sin((Math.PI * s) / 0.32) ** 0.6
      }
      const beat = s > 0.25 ? Math.max(0, Math.sin(2 * Math.PI * 7 * (s - 0.25))) ** 4 * Math.exp(-(s - 0.25) / 0.35) : 0
      out[i] = v + wings[i] * beat * 1.4
    }
  }, 0.7)

/** A bicycle bell: tring-tring, two quick runs of strikes. */
export const bell = () =>
  render(0.9, (out) => {
    const strike = new Float32Array(secs(0.4))
    for (let i = 0; i < strike.length; i++) {
      const s = i / SR
      strike[i] = [1900, 1900 * 2.02, 1900 * 2.76].reduce((a, f, k) => a + Math.sin(2 * Math.PI * f * s) * Math.exp(-s / (0.12 - k * 0.03)) / (k + 1), 0)
    }
    for (const run of [0, 0.32]) for (let k = 0; k < 4; k++) mixAt(out, strike, run + k * 0.035, 0.6)
  }, 0.55)

/** A sleeping dog: one slow snore, in and out. */
export const snore = () =>
  render(1.6, (out, t) => {
    const n = filter(noise(out.length, 32), 'lowpass', 420)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      const breath = s < 0.9 ? Math.sin((Math.PI * s) / 0.9) ** 2 : 0.4 * Math.sin((Math.PI * (s - 0.9)) / 0.7) ** 2
      const rattle = s < 0.9 ? 0.6 + 0.4 * Math.sin(2 * Math.PI * 30 * s) : 1
      out[i] = n[i] * breath * rattle
    }
  }, 0.6)

/** The dog, woken: a short huff through the nose. */
export const huff = () =>
  render(0.3, (out, t) => {
    const n = filter(noise(out.length, 33), 'bandpass', 650, 0.9)
    for (let i = 0; i < out.length; i++) out[i] = n[i] * hit(t(i), 0.015, 0.07)
  }, 0.6)

/** The laughter club: a few uncles going "ha… ha… ha…", slightly out of step. */
export const laugh = () =>
  render(1.5, (out) => {
    const r = rng(34)
    for (const [start, f0] of [[0, 150], [0.07, 190], [0.15, 125]] as const) {
      for (let k = 0; k < 4; k++) {
        const at = start + k * 0.27 + r() * 0.03
        const len = secs(0.17)
        const f1 = new Biquad('bandpass', 760, 3)
        const f2 = new Biquad('bandpass', 1220, 4)
        const breath = noise(len, 35 + k)
        let ph = 0
        const o = secs(at)
        for (let i = 0; i < len && o + i < out.length; i++) {
          const u = i / len
          ph += (f0 * (1.1 - 0.15 * u - 0.04 * k)) / SR
          const src = (2 * (ph % 1) - 1) * (u > 0.08 ? 1 : 0.2) + breath[i] * (u < 0.15 ? 0.8 : 0.1)
          out[o + i] += (f1.run(src) + 0.6 * f2.run(src)) * Math.sin(Math.PI * u) ** 0.8
        }
      }
    }
  }, 0.6)

/** An umbrella opening: a rush of cloth, then the ribs snapping taut. */
export const umbrellaOpen = () =>
  render(0.4, (out, t) => {
    const n = noise(out.length, 36)
    const bp = new Biquad('bandpass', 400, 0.9)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      if (i % 64 === 0) bp.set(350 + 1500 * (s / 0.3), 0.9)
      out[i] = bp.run(n[i]) * (s < 0.3 ? Math.sin((Math.PI * s) / 0.3) : 0) + n[i] * 0.5 * hit(s - 0.29, 0.001, 0.012)
    }
  }, 0.6)

/** Folding it away: a shorter rustle down and a soft click of the strap. */
export const umbrellaClose = () =>
  render(0.32, (out, t) => {
    const n = noise(out.length, 37)
    const bp = new Biquad('bandpass', 1200, 0.9)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      if (i % 64 === 0) bp.set(1300 - 900 * (s / 0.22), 0.9)
      out[i] = bp.run(n[i]) * (s < 0.22 ? Math.sin((Math.PI * s) / 0.22) : 0) + n[i] * 0.3 * hit(s - 0.25, 0.001, 0.008)
    }
  }, 0.5)

/** A gust off the sea: wind rising, rushing past, and dying away. */
export const gust = () =>
  render(2.2, (out, t) => {
    const n = noise(out.length, 38)
    const bp = new Biquad('bandpass', 300, 0.7)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      const env = bump(s, 0.8, 0.45)
      if (i % 64 === 0) bp.set(250 + 900 * env, 0.7)
      out[i] = bp.run(n[i]) * env * (0.8 + 0.2 * Math.sin(2 * Math.PI * 5 * s))
    }
  }, 0.7)

/** A soap bubble popping: a tiny wet click. */
export const pop = () =>
  render(0.06, (out, t) => {
    const n = filter(noise(out.length, 39), 'bandpass', 2400, 1.5)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      out[i] = n[i] * hit(s, 0.001, 0.008) + Math.sin(2 * Math.PI * 1800 * s) * hit(s, 0.001, 0.006) * 0.5
    }
  }, 0.6)

/** An old film song leaking out of a shared pair of earphones: tinny and far away. */
export const song = () =>
  render(4.8, (out, t) => {
    // a simple tune in a minor key, over a soft held chord
    const tune = [440, 523, 587, 523, 440, 392, 440, 0, 523, 587, 659, 587, 523, 440]
    const beat = 0.32
    const bp = new Biquad('bandpass', 1300, 0.9)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      const k = Math.floor(s / beat)
      const f = tune[k % tune.length]
      const u = (s % beat) / beat
      const voice = f ? Math.sin(2 * Math.PI * f * s + 0.6 * Math.sin(2 * Math.PI * 5.5 * s)) * Math.sin(Math.PI * Math.min(1, u * 1.2)) : 0
      const pad = (Math.sin(2 * Math.PI * 220 * s) + Math.sin(2 * Math.PI * 261.6 * s) + Math.sin(2 * Math.PI * 329.6 * s)) * 0.15
      const env = Math.min(1, s / 0.4) * Math.min(1, (4.8 - s) / 0.6)
      out[i] = bp.run(voice + pad) * env
    }
  }, 0.6)

/** An old lamp's bulb buzzing as it flickers on. */
export const buzz = () =>
  render(0.16, (out, t) => {
    const n = filter(noise(out.length, 45), 'bandpass', 2400, 2)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      const hum = Math.sign(Math.sin(2 * Math.PI * 100 * s)) * 0.5
      out[i] = (hum * 0.6 + n[i] * 0.4) * Math.min(1, s / 0.01) * Math.min(1, (0.16 - s) / 0.03)
    }
  }, 0.5)

/** An old taxi's horn: two flat, nasal blasts. */
export const honk = () =>
  render(0.6, (out, t) => {
    const lp = new Biquad('lowpass', 1400)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      const on = s < 0.18 || (s > 0.26 && s < 0.5)
      const v = on ? Math.sign(Math.sin(2 * Math.PI * 370 * s)) + 0.8 * Math.sign(Math.sin(2 * Math.PI * 440 * s)) : 0
      out[i] = lp.run(v)
    }
  }, 0.5)

/** A fishing reel winding in: a fast run of ratchet clicks. */
export const reel = () =>
  render(0.9, (out) => {
    const click = filter(noise(secs(0.006), 46), 'bandpass', 3200, 2)
    for (let k = 0; k < 26; k++) mixAt(out, click, k * 0.032 + (k % 2) * 0.004, 0.6 + (k % 3) * 0.15)
  }, 0.5)

/** A bundle of newspapers dropped on a pile: a soft, papery thud. */
export const thump = () =>
  render(0.25, (out, t) => {
    const n = filter(noise(out.length, 47), 'lowpass', 900)
    for (let i = 0; i < out.length; i++) {
      const s = t(i)
      out[i] = n[i] * hit(s, 0.002, 0.04) + Math.sin(2 * Math.PI * 70 * s) * hit(s, 0.002, 0.05) * 0.8
    }
  }, 0.6)

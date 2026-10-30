// Tiny DSP kit for sounds made in code: seeded noise, RBJ biquad filters, envelopes,
// seamless loops. Everything renders straight into Float32Arrays, mono, at SR.

export const SR = 22050

export type Buf = Float32Array

export const secs = (s: number) => Math.round(s * SR)

/** Seeded random (mulberry32), so every visit hears the same night. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function noise(n: number, seed: number): Buf {
  const r = rng(seed)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) out[i] = r() * 2 - 1
  return out
}

type FilterType = 'lowpass' | 'highpass' | 'bandpass'

/** RBJ cookbook biquad. Call set() any time to sweep it. */
export class Biquad {
  private b0 = 1
  private b1 = 0
  private b2 = 0
  private a1 = 0
  private a2 = 0
  private x1 = 0
  private x2 = 0
  private y1 = 0
  private y2 = 0

  constructor(
    private type: FilterType,
    freq: number,
    q = 0.707,
  ) {
    this.set(freq, q)
  }

  set(freq: number, q = 0.707) {
    const w = (2 * Math.PI * Math.min(freq, SR * 0.45)) / SR
    const cos = Math.cos(w)
    const alpha = Math.sin(w) / (2 * q)
    const a0 = 1 + alpha
    let b0: number, b1: number, b2: number
    if (this.type === 'lowpass') [b0, b1, b2] = [(1 - cos) / 2, 1 - cos, (1 - cos) / 2]
    else if (this.type === 'highpass') [b0, b1, b2] = [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2]
    else [b0, b1, b2] = [alpha, 0, -alpha]
    this.b0 = b0 / a0
    this.b1 = b1 / a0
    this.b2 = b2 / a0
    this.a1 = (-2 * cos) / a0
    this.a2 = (1 - alpha) / a0
  }

  run(x: number) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2
    this.x2 = this.x1
    this.x1 = x
    this.y2 = this.y1
    this.y1 = y
    return y
  }
}

/** Run a whole buffer through a filter. */
export function filter(src: Buf, type: FilterType, freq: number, q?: number): Buf {
  const f = new Biquad(type, freq, q)
  const out = new Float32Array(src.length)
  for (let i = 0; i < src.length; i++) out[i] = f.run(src[i])
  return out
}

/** A short attack then an exponential decay, both in seconds. */
export const hit = (t: number, attack: number, decay: number) =>
  t < 0 ? 0 : t < attack ? t / attack : Math.exp(-(t - attack) / decay)

/** A soft bump centred on c, width w (seconds). */
export const bump = (t: number, c: number, w: number) => Math.exp(-(((t - c) / w) ** 2))

/** Add src into dst starting at a time (seconds), scaled. Wraps around for loops. */
export function mixAt(dst: Buf, src: Buf, at: number, gain = 1, wrap = false) {
  const o = secs(at)
  for (let i = 0; i < src.length; i++) {
    let j = o + i
    if (j >= dst.length) {
      if (!wrap) break
      j %= dst.length
    }
    dst[j] += src[i] * gain
  }
}

/** Fold the last `fade` seconds over the start with an equal-power crossfade, so it loops cleanly. */
export function loopify(src: Buf, fade: number): Buf {
  const f = secs(fade)
  const n = src.length - f
  const out = src.slice(0, n)
  for (let i = 0; i < f; i++) {
    const k = i / f
    out[i] = src[n + i] * Math.cos((k * Math.PI) / 2) + src[i] * Math.sin((k * Math.PI) / 2)
  }
  return out
}

/** Scale to a peak level, with a few ms of fade at the ends for one-shots. */
export function finish(src: Buf, peak = 0.9, edges = true): Buf {
  let max = 1e-6
  for (const v of src) max = Math.max(max, Math.abs(v))
  const g = peak / max
  const e = edges ? secs(0.004) : 0
  for (let i = 0; i < src.length; i++) {
    let w = g
    if (e && i < e) w *= i / e
    if (e && i > src.length - e) w *= (src.length - i) / e
    src[i] *= w
  }
  return src
}

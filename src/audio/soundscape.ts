import { Howl, Howler } from 'howler'
import { BHUTTA_X } from '../data/places'
import { SCENES } from '../data/scenes'
import { ss, timeOfDay } from '../lib/time'
import { effectiveP, useStore } from '../store/useStore'
import { frame } from '../world/frame'
import * as ambience from './beds'
import * as music from './music'
import { setSoundPlayer, type SoundName, type SoundOpts } from './bus'
import type { Buf } from './dsp'
import * as sfx from './sfx'
import { initTriggers } from './triggers'
import * as uiSfx from './uiSfx'
import { wavUrl } from './wav'

// The night's soundscape. Ambient beds crossfade by time of night (the same curves
// as the sky), one-shots answer the world and the UI (see triggers.ts). Every sound
// is generated in code; to use a recording instead, point its Howl at a file in /public.
//
// Mixed after Until Then: the city is a soft, muffled backdrop you half notice,
// never something that competes with you. Everything sits low and warm.

// Every loop: the city's ambient beds and the three music moods.
const beds = { ...ambience, ...music }
type BedId = keyof typeof beds

const howl = (data: Buf, loop: boolean) => new Howl({ src: [wavUrl(data)], format: ['wav'], loop, volume: 0 })

const bedHowls = {} as Record<BedId, Howl>
const oneShots = {} as Record<SoundName, Howl>
const level = Object.fromEntries(Object.keys(beds).map((id) => [id, 0])) as Record<BedId, number>

/** Render every sound, one per task, so the title card keeps animating meanwhile. */
async function build() {
  const pause = () => new Promise((r) => setTimeout(r, 0))
  for (const [id, make] of Object.entries(beds)) {
    await pause()
    bedHowls[id as BedId] = howl(make(), true)
  }
  for (const [id, make] of [...Object.entries(sfx), ...Object.entries(uiSfx)]) {
    await pause()
    oneShots[id as SoundName] = howl(make(), false)
  }
}
export const ready = build()

// How loud each one-shot plays. The beds sit low; short sounds sit clearly above
// them, or phone speakers lose them entirely (Ali couldn't hear clicks on iPhone).
const VOLUME: Record<SoundName, number> = {
  step: 0.3, splash: 0.3, pour: 0.66, coin: 0.42, shutter: 0.6, whistle: 0.24, purr: 0.9, trainHorn: 0.24,
  meow: 0.48, paper: 0.54, paperSlide: 0.3, balloon: 0.42, caw: 0.36, bell: 0.3, snore: 0.36, huff: 0.36,
  laugh: 0.36, umbrellaOpen: 0.48, umbrellaClose: 0.36, gust: 0.6, pop: 0.24, song: 0.42, buzz: 0.15, honk: 0.24, reel: 0.3, thump: 0.36,
  tick: 0.11, click: 0.21, select: 0.18, back: 0.15, hover: 0.09, phone: 0.21, phoneClose: 0.15, tap: 0.15,
  message: 0.21, send: 0.15, page: 0.42, photo: 0.36, twinkle: 0.24, chime: 0.3, swell: 0.42, sting: 0.21, pageFound: 0.36,
}

// Higher voices tick higher. Anyone not listed gets the default.
const VOICE: Record<string, number> = { Manish: 0.95, Indie: 1.3, 'Chai wala': 0.8 }

function play(name: SoundName, { x, rate = 1, voice }: SoundOpts = {}) {
  const h = oneShots[name]
  if (!h) return
  let volume = VOLUME[name]
  let pan = 0
  // Things in the world pan with where they are, and fade as you walk away.
  if (x !== undefined) {
    const dx = x - frame.camX
    pan = Math.max(-0.7, Math.min(0.7, dx / 10))
    volume /= 1 + (dx / 9) ** 2
  }
  if (voice !== undefined) rate *= (VOICE[voice ?? ''] ?? 0.9) * (0.97 + Math.random() * 0.06)
  const id = h.play()
  h.volume(volume, id)
  h.rate(rate, id)
  if (pan) h.stereo(pan, id)
}

const SEA_WALL_X = SCENES.find((s) => s.id === 'constellations')!.x
/** Ali's laptop in Scene 1. */
const LAPTOP_X = SCENES[0].x

/** The three music moods, crossfaded by time of night. */
function musicLevels(p: number, on: number) {
  const dusk = 1 - ss(0.28, 0.42, p)
  const dawn = ss(0.8, 0.92, p)
  const night = Math.max(0, 1 - dusk - dawn)
  const level = 0.16 * on
  return { musicDusk: dusk * level, musicNight: night * level, musicDawn: dawn * level }
}

/** How loud each bed should be right now. */
function targets(): Record<BedId, number> {
  const s = useStore.getState()
  const t = timeOfDay(effectiveP(s))
  const near = (x: number, range: number) => Math.max(0, 1 - Math.abs(frame.camX - x) / range)
  const duck = s.radioOn ? 0.45 : 1
  const typing = !s.dialogue || (s.focus !== 'ali' && s.focus !== 'laptop')
  return {
    sea: (0.26 + 0.12 * near(SEA_WALL_X, 22) + 0.08 * t.rain) * duck,
    traffic: (0.16 * (1 - ss(0.38, 0.62, t.p)) + 0.06 * t.dawn) * (1 - 0.5 * t.rain) * duck,
    rain: 0.3 * t.rain * (s.umbrellaOpen ? 0.7 : 1) * duck,
    canopy: s.umbrellaOpen ? 0.3 * t.rain * duck : 0,
    crickets: 0.05 * t.night * (1 - t.rain) * duck,
    morning: 0.18 * t.dawn * duck,
    typing: typing ? 0.1 * near(LAPTOP_X, 7) ** 2 * duck : 0,
    coals: 0.14 * near(BHUTTA_X, 8) ** 2 * (1 - t.rain) * duck,
    radio: s.radioOn ? 0.4 : 0,
    // the music steps aside for the radio, and drops a little while people talk
    ...musicLevels(t.p, s.music && !s.radioOn ? (s.dialogue ? 0.7 : 1) : 0),
  }
}

const TICK = 0.05
/** Seconds to rise from silence when the night starts, so it never jumps out at you. */
const FADE_IN = 5
let since = 0
let master = 0
let stepPhase = 0
let stepSide = 1

/** The slider is in loudness, not gain: half way should sound about half as loud. */
const gainFor = (v: number) => v ** 1.6

function tick() {
  since += TICK
  const s = useStore.getState()
  const goal = gainFor(s.volume)
  // A slow linear rise at the start; after that, follow the slider closely.
  master = since < FADE_IN ? Math.min(goal, (goal * since) / FADE_IN) : master + (goal - master) * 0.35
  Howler.volume(master)

  const want = targets()
  for (const id of Object.keys(bedHowls) as BedId[]) {
    const h = bedHowls[id]
    // ease toward the target so crossfades never click (~1s)
    level[id] += (want[id] - level[id]) * 0.12
    if (level[id] < 0.002 && want[id] === 0) {
      level[id] = 0
      if (h.playing()) h.pause()
      continue
    }
    if (!h.playing()) h.play()
    h.volume(level[id])
  }

  // Footsteps follow the walk; the pace follows the speed. Wet stone splashes.
  if (!s.focus && frame.speed > 0.8) {
    stepPhase += TICK * Math.min(3.2, Math.max(1.6, 0.8 + frame.speed * 0.3))
    if (stepPhase >= 1) {
      stepPhase -= 1
      stepSide = -stepSide
      const wet = timeOfDay(effectiveP(s)).rain > 0.3
      play(wet ? 'splash' : 'step', { rate: 0.9 + Math.random() * 0.2, x: frame.camX + 0.6 * stepSide })
    }
  } else stepPhase = 0.6
}

function syncMute() {
  Howler.mute(!useStore.getState().sound || document.hidden)
}

/** Round off the top end of everything, like hearing the city through a window. */
function muffle() {
  const ctx = Howler.ctx
  if (!ctx || !Howler.masterGain) return
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 3800
  lp.Q.value = 0.5
  Howler.masterGain.disconnect()
  Howler.masterGain.connect(lp)
  lp.connect(ctx.destination)
}

/** Start the night's sound. Call from a click so browsers let it play. */
export function startSoundscape() {
  Howler.volume(0)
  muffle()
  syncMute()
  document.addEventListener('visibilitychange', syncMute)
  useStore.subscribe((st, prev) => st.sound !== prev.sound && syncMute())
  window.setInterval(tick, TICK * 1000)
  setSoundPlayer(play)
  initTriggers(play)
}

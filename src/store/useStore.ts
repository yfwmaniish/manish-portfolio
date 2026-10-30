import { create } from 'zustand'
import { MOMENTS, type MomentId } from '../data/moments'
import { pAt, WALK_END } from '../data/scenes'

// Walkable stretch of promenade, in world units along x.
export const WALK_MIN = -8
export const WALK_MAX = WALK_END

const TOAST_MS = 3000
// Between the chai wala and Ali, so both are on screen when the night begins.
const START_X = -2.2

/** Who or what the camera moves in on during a conversation. */
export type Focus = 'ali' | 'laptop' | 'vendor' | 'cat' | 'ali2' | 'ali3' | 'ali4' | 'ali5' | 'sky' | 'ali6'
export type Showing = 'veherex' | 'nicetry' | 'tejal' | 'sentiment' | 'scan' | 'about' | 'roll' | 'notebook' | 'stars' | 'scam' | 'ev'

export interface DialogueState {
  who: string | null
  /** Expression for the speaker's portrait, from the line's Ink tag. */
  mood: string
  text: string
  /** Empty while there are more lines to read. */
  choices: { index: number; text: string }[]
  /** Bumps on every new line so the typewriter restarts. */
  line: number
}

export type Flags = Record<string, boolean | number | string>

interface State {
  /** Time of night from story progress (0–1). */
  p: number
  /** Time machine override; wins over p when set. */
  tOverride: number | null
  /** Where the walk is heading; the camera eases toward it. */
  walkTarget: number
  /** Normalised pointer, -1…1, for look-around. */
  pointer: { x: number; y: number }
  motion: boolean
  /** Sound on or off (saved). */
  sound: boolean
  /** Master volume, 0–1 (saved). Starts low: nobody wants a loud surprise. */
  volume: number
  /** Soft background music on or off (saved). */
  music: boolean
  /** Marine Drive FM playing in the phone's Radio app. */
  radioOn: boolean

  moments: Partial<Record<MomentId, true>>
  toast: string | null

  /** Story variables, mirrored from Ink after every line. */
  flags: Flags
  dialogue: DialogueState | null
  focus: Focus | null
  showing: Showing | null
  phoneOpen: boolean
  endingOpen: boolean
  /** Past the title card. */
  started: boolean
  /** The 3D city has drawn its first frames. */
  worldReady: boolean

  catPets: number
  balloonsFreed: number
  /** The umbrella seller gave you one (saved). */
  umbrellaOwned: boolean
  /** Your umbrella is open over your head. */
  umbrellaOpen: boolean
  flyersCaught: string[]
  openFlyer: string | null
  /** Notebook pages you've picked up (saved). */
  pagesFound: string[]
  /** Things you've already clicked, so their "!" goes away (saved). */
  touched: string[]
  /** The page being read right now. */
  openPage: string | null
  /** The gust has blown Ali's pages away (saved). */
  gustDone: boolean

  /** What the pointer is over in the 3D world, for the cursor tag. */
  hovered: { id: string; label: string } | null
  /** Speech bubbles over things in the world, by anchor id. */
  speech: Record<string, string>

  setP: (p: number) => void
  setTimeOverride: (t: number | null) => void
  walkBy: (dx: number) => void
  walkTo: (x: number) => void
  setPointer: (x: number, y: number) => void
  setMotion: (on: boolean) => void
  setSound: (on: boolean) => void
  setVolume: (v: number) => void
  setMusic: (on: boolean) => void
  setUmbrella: (open: boolean) => void
  setRadio: (on: boolean) => void
  unlock: (id: MomentId) => void
  petCat: () => number
  freeBalloon: () => void
  catchFlyer: (id: string) => void
  closeFlyer: () => void
  findPage: (id: string) => void
  touch: (id: string) => void
  closePage: () => void
  setHovered: (h: State['hovered']) => void
  setPhoneOpen: (open: boolean) => void
  say: (id: string, text: string, ms?: number) => void
}

let toastTimer: ReturnType<typeof setTimeout> | undefined
const speechTimers = new Map<string, ReturnType<typeof setTimeout>>()

const clampWalk = (x: number) => Math.min(WALK_MAX, Math.max(WALK_MIN, x))

export const useStore = create<State>((set, get) => ({
  p: pAt(START_X),
  tOverride: null,
  walkTarget: START_X,
  pointer: { x: 0, y: 0 },
  motion: true,
  sound: true,
  volume: 0.35,
  music: true,
  radioOn: false,

  moments: {},
  toast: null,

  flags: {},
  dialogue: null,
  focus: null,
  showing: null,
  phoneOpen: false,
  endingOpen: false,
  started: false,
  worldReady: false,

  catPets: 0,
  balloonsFreed: 0,
  umbrellaOwned: false,
  umbrellaOpen: false,
  flyersCaught: [],
  openFlyer: null,
  pagesFound: [],
  touched: [],
  openPage: null,
  gustDone: false,

  hovered: null,
  speech: {},

  setP: (p) => set({ p }),
  setTimeOverride: (tOverride) => set({ tOverride }),
  walkBy: (dx) => set((s) => ({ walkTarget: clampWalk(s.walkTarget + dx) })),
  walkTo: (x) => set({ walkTarget: clampWalk(x) }),
  setPointer: (x, y) => set({ pointer: { x, y } }),
  setMotion: (motion) => set({ motion }),
  setSound: (sound) => set(sound ? { sound } : { sound, radioOn: false }),
  // Dragging the volume up from zero means you want to hear it.
  setMusic: (music) => set({ music }),
  setUmbrella: (umbrellaOpen) => set({ umbrellaOpen, umbrellaOwned: true }),
  setVolume: (volume) => set(volume > 0 ? { volume, sound: true } : { volume }),
  // Asking for the radio turns sound on: pressing Play and hearing nothing would feel broken.
  setRadio: (radioOn) => set(radioOn ? { radioOn, sound: true } : { radioOn }),

  unlock: (id) => {
    if (get().moments[id]) return
    const def = MOMENTS.find((m) => m.id === id)
    set((s) => ({ moments: { ...s.moments, [id]: true }, toast: def?.title ?? id }))
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => set({ toast: null }), TOAST_MS)
  },
  petCat: () => {
    const n = get().catPets + 1
    set({ catPets: n })
    get().unlock('cat')
    return n
  },
  freeBalloon: () => set((s) => ({ balloonsFreed: s.balloonsFreed + 1 })),
  catchFlyer: (id) =>
    set((s) => ({
      openFlyer: id,
      flyersCaught: s.flyersCaught.includes(id) ? s.flyersCaught : [...s.flyersCaught, id],
    })),
  closeFlyer: () => set({ openFlyer: null }),
  findPage: (id) =>
    set((s) => ({ openPage: id, pagesFound: s.pagesFound.includes(id) ? s.pagesFound : [...s.pagesFound, id] })),
  closePage: () => set({ openPage: null }),
  touch: (id) => set((s) => (s.touched.includes(id) ? s : { touched: [...s.touched, id] })),
  setHovered: (hovered) => set({ hovered }),
  setPhoneOpen: (phoneOpen) => {
    set({ phoneOpen })
    if (phoneOpen) get().unlock('phone')
  },
  say: (id, text, ms = 1800) => {
    set((s) => ({ speech: { ...s.speech, [id]: text } }))
    clearTimeout(speechTimers.get(id))
    speechTimers.set(
      id,
      setTimeout(() => {
        const speech = { ...get().speech }
        delete speech[id]
        set({ speech })
      }, ms),
    )
  },
}))

/** The time of night everything should render at. */
export const effectiveP = (s: Pick<State, 'p' | 'tOverride'>) => s.tOverride ?? s.p

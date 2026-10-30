import { useStore } from '../store/useStore'

// Progress lives in this browser only. Every read and write is guarded: private
// windows and blocked storage just mean nothing is remembered.
const KEY = 'one-evening:v1'

interface Save {
  story?: string
  moments?: Record<string, true>
  catPets?: number
  balloonsFreed?: number
  flyersCaught?: string[]
  sound?: boolean
  volume?: number
  music?: boolean
  umbrella?: boolean
  pages?: string[]
  gust?: boolean
  touched?: string[]
}

function read(): Save {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Save
  } catch {
    return {}
  }
}

function write(patch: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...read(), ...patch }))
  } catch {
    // storage unavailable
  }
}

export const loadStoryState = () => read().story
export const saveStoryState = (story: string) => write({ story })

/** Restore moments and small world facts, then keep saving them as they change. */
export function initSave() {
  const s = read()
  useStore.setState({
    moments: s.moments ?? {},
    catPets: s.catPets ?? 0,
    balloonsFreed: s.balloonsFreed ?? 0,
    flyersCaught: s.flyersCaught ?? [],
    sound: s.sound ?? true,
    volume: s.volume ?? 0.35,
    music: s.music ?? true,
    umbrellaOwned: s.umbrella ?? false,
    pagesFound: s.pages ?? [],
    gustDone: s.gust ?? false,
    touched: s.touched ?? [],
  })
  return useStore.subscribe((st, prev) => {
    if (
      st.moments !== prev.moments ||
      st.catPets !== prev.catPets ||
      st.balloonsFreed !== prev.balloonsFreed ||
      st.flyersCaught !== prev.flyersCaught ||
      st.sound !== prev.sound ||
      st.volume !== prev.volume ||
      st.music !== prev.music ||
      st.umbrellaOwned !== prev.umbrellaOwned ||
      st.pagesFound !== prev.pagesFound ||
      st.gustDone !== prev.gustDone ||
      st.touched !== prev.touched
    )
      write({
        moments: st.moments,
        catPets: st.catPets,
        balloonsFreed: st.balloonsFreed,
        flyersCaught: st.flyersCaught,
        sound: st.sound,
        volume: st.volume,
        music: st.music,
        umbrella: st.umbrellaOwned,
        pages: st.pagesFound,
        gust: st.gustDone,
        touched: st.touched,
      })
  })
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // storage unavailable
  }
}

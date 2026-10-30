import { create } from 'zustand'
import { CHAT, CHAT_INTRO, CHAT_INVITE } from '../data/chat'
import type { Project } from '../data/projects'
import { on } from '../engine/events'
import { useStore } from '../store/useStore'

export type AppId =
  | 'lock'
  | 'home'
  | 'messages'
  | 'map'
  | 'gallery'
  | 'notes'
  | 'pages'
  | 'clock'
  | 'camera'
  | 'weather'
  | 'radio'
  | 'moments'
  | 'contact'

export interface ChatMsg {
  me: boolean
  text: string
  card?: boolean
}

interface PhoneState {
  app: AppId
  locked: boolean
  pending: AppId | null
  galleryItem: Project['id'] | null
  unread: number
  log: ChatMsg[]
  asked: string[]
  typing: boolean
  intro: boolean
  photo: boolean
  flash: boolean
  shots: number

  openPhone: (target?: AppId) => void
  closePhone: () => void
  unlockPhone: () => void
  openApp: (app: AppId) => void
  goHome: () => void
  openGalleryItem: (id: Project['id'] | null) => void
  ask: (key: string) => void
  togglePhoto: () => void
  snap: () => void
}

const timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))

export const usePhone = create<PhoneState>((set, get) => {
  const viewingMessages = () => useStore.getState().phoneOpen && get().app === 'messages'

  /** Ali "types" each line; replies arrive one by one, timed as in the prototype. */
  const aliSays = (lines: string[], card = false) => {
    set({ typing: true })
    let d = 300
    lines.forEach((text, i) => {
      d += 650 + Math.min(text.length * 18, 1500)
      later(d, () => {
        const last = i === lines.length - 1 && !card
        set((s) => ({
          log: [...s.log, { me: false, text }],
          typing: !last,
          unread: viewingMessages() ? 0 : s.unread + 1,
        }))
      })
    })
    if (card) later(d + 700, () => set((s) => ({ log: [...s.log, { me: false, text: '', card: true }], typing: false })))
  }

  const enterMessages = () => {
    set({ unread: 0 })
    if (get().intro) return
    set({ intro: true, log: CHAT_INTRO.map((text) => ({ me: false, text })) })
    aliSays([CHAT_INVITE])
  }

  return {
    app: 'lock',
    locked: true,
    pending: null,
    galleryItem: null,
    unread: 3,
    log: [],
    asked: [],
    typing: false,
    intro: false,
    photo: false,
    flash: false,
    shots: 0,

    openPhone: (target) => {
      const s = get()
      useStore.getState().setPhoneOpen(true)
      if (s.locked) set({ app: 'lock', pending: target ?? null, galleryItem: null })
      else {
        set({ app: target ?? (s.app === 'lock' ? 'home' : s.app), galleryItem: null })
        if (target === 'messages') enterMessages()
      }
    },
    closePhone: () => useStore.getState().setPhoneOpen(false),
    unlockPhone: () => {
      const t = get().pending ?? 'home'
      set({ locked: false, app: t, pending: null })
      if (t === 'messages') enterMessages()
    },
    openApp: (app) => {
      set({ app, galleryItem: null })
      if (app === 'messages') enterMessages()
    },
    goHome: () => {
      if (!get().locked) set({ app: 'home', galleryItem: null })
    },
    openGalleryItem: (galleryItem) => set({ galleryItem }),
    ask: (key) => {
      const s = get()
      if (s.typing || s.asked.includes(key)) return
      const q = CHAT[key]
      set({ log: [...s.log, { me: true, text: q.q }], asked: [...s.asked, key] })
      aliSays(q.a, q.card)
    },
    togglePhoto: () => {
      const photo = !get().photo
      set({ photo })
      if (photo) useStore.getState().setPhoneOpen(false)
    },
    snap: () => {
      set((s) => ({ flash: true, shots: s.shots + 1 }))
      later(380, () => set({ flash: false }))
      useStore.getState().unlock('photo')
    },
  }
})

// A camera flash from the story (taking Ali's picture), without counting as photo mode.
on('snap', () => {
  usePhone.setState({ flash: true })
  later(380, () => usePhone.setState({ flash: false }))
})

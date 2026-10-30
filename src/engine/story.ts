import { Story } from 'inkjs'
import { sound } from '../audio/bus'
import storyJson from '../../story/promenade.ink'
import type { MomentId } from '../data/moments'
import { usePhone } from '../phone/usePhone'
import { useStore, type Flags, type Focus, type Showing } from '../store/useStore'
import { emit, type Cue } from './events'
import { focusCamera } from './focus'
import { loadStoryState, saveStoryState } from './save'

// Story variables the world reacts to. Mirrored into the store's `flags`.
const VARS = ['talked_ali', 'talked_vendor', 'chai_bought', 'chai_debt_paid', 'ali_knows_debt', 'cat_follows', 'met_ali2', 'took_portrait', 'met_ali3', 'met_ali4', 'met_ali5', 'met_ali6', 'gave_pages']
const SPEAKER = /^([A-Z][A-Za-z' ]{0,20}):\s+(.*)$/

let story: Story | null = null
let lineCount = 0

function getStory() {
  if (story) return story
  const s = new Story(storyJson)
  const st = useStore.getState
  s.BindExternalFunction('look', (target: string) => st().focus !== target && useStore.setState({ focus: target as Focus }), false)
  s.BindExternalFunction('show', (what: string) => useStore.setState({ showing: (what || null) as Showing | null }), false)
  s.BindExternalFunction('cue', (name: string) => emit(name as Cue), false)
  s.BindExternalFunction('moment', (id: string) => st().unlock(id as MomentId), false)
  // "Take the phone" opens it exactly like the phone button does
  s.BindExternalFunction('phone', () => usePhone.getState().openPhone('home'), false)
  s.BindExternalFunction(
    'ending',
    () => {
      closeTalk()
      useStore.setState({ endingOpen: true })
    },
    false,
  )
  const saved = loadStoryState()
  if (saved) {
    try {
      s.state.LoadJson(saved)
    } catch {
      // an old save from a different story; start fresh
    }
  }
  story = s
  syncFlags()
  return s
}

function syncFlags() {
  if (!story) return
  const flags: Flags = {}
  for (const v of VARS) flags[v] = story.variablesState.$(v) as Flags[string]
  useStore.setState({ flags })
}

/** Read on until the next line worth showing, or until there are only choices left. */
function step() {
  const s = getStory()
  let who: string | null = null
  let text = ''
  let mood = 'neutral'
  while (s.canContinue) {
    const line = (s.Continue() ?? '').trim()
    syncFlags()
    if (!line) continue
    const m = SPEAKER.exec(line)
    who = m ? m[1] : null
    text = m ? m[2] : line
    mood = s.currentTags?.[0]?.trim() || 'neutral'
    break
  }
  saveStoryState(s.state.ToJson())
  const choices = s.canContinue ? [] : s.currentChoices.map((c) => ({ index: c.index, text: c.text }))
  if (!text && choices.length === 0) {
    closeTalk()
    return
  }
  useStore.setState({ dialogue: { who, mood, text, choices, line: ++lineCount } })
}

/** Open a conversation at an Ink knot: 'ali', 'vendor', 'cat'. */
export function startTalk(knot: string) {
  const st = useStore.getState()
  if (st.phoneOpen || st.openFlyer || st.openPage || st.endingOpen) return
  const s = getStory()
  // the story can react to how many notebook pages you've found
  s.variablesState.$('pages_found', st.pagesFound.length)
  s.ChoosePathString(knot)
  step()
}

/** Next line (only when there are no choices waiting). */
export function advance() {
  const d = useStore.getState().dialogue
  if (d && d.choices.length === 0) {
    sound('click')
    step()
  }
}

export function choose(index: number) {
  sound('select')
  getStory().ChooseChoiceIndex(index)
  step()
}

/** Walk away from the conversation; the walk carries on from where the camera is. */
export function closeTalk() {
  const { focus, walkTo } = useStore.getState()
  if (focus) walkTo(focusCamera(focus).x)
  useStore.setState({ dialogue: null, focus: null, showing: null })
}

/** Load the story early so saved flags (a paid tab, a following cat) show up at once. */
export function initStory() {
  getStory()
}

export function resetStory() {
  getStory().ResetState()
  syncFlags()
}

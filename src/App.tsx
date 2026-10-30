import { lazy, Suspense, useEffect } from 'react'
import { initWatchers } from './engine/watchers'
import { useWalkInput } from './engine/useWalkInput'
import { Phone } from './phone/Phone'
import { PhoneButton } from './phone/PhoneButton'
import { usePhone } from './phone/usePhone'
import { CameraRoll } from './ui/CameraRoll'
import { ChapterCard } from './ui/ChapterCard'
import { Constellations } from './ui/Constellations'
import { DialogueBox } from './ui/DialogueBox'
import { Ending } from './ui/Ending'
import { FlyerCard } from './ui/FlyerCard'
import { HotspotList } from './ui/HotspotList'
import { Notebook } from './ui/Notebook'
import { ScamCheck } from './ui/ScamCheck'
import { AegisCheck } from './ui/AegisCheck'
import { PageCard } from './ui/PageCard'
import { HoverTag } from './ui/HoverTag'
import { Hud } from './ui/Hud'
import { PhotoMode } from './ui/PhotoMode'
import { ScreenCard } from './ui/ScreenCard'
import { Toast } from './ui/Toast'
import { UmbrellaButton } from './ui/UmbrellaButton'
import { WalkNav } from './ui/WalkNav'
import { UmbrellaOverlay } from './ui/UmbrellaOverlay'
import { WorldLabels } from './ui/WorldLabels'
import { InteractHints } from './ui/InteractHints'
import { Title } from './ui/Title'
import { useStore } from './store/useStore'

// The 3D city (three.js and friends) loads behind the title card.
const World = lazy(() => import('./world/World'))

export function App() {
  useWalkInput()
  useEffect(initWatchers, [])
  // Photo mode clears every word off the screen.
  const photo = usePhone((s) => s.photo)
  const started = useStore((s) => s.started)

  return (
    <main>
      <h1 className="sr-only">Manish Tiwari — One Evening in Mumbai</h1>
      <Suspense fallback={null}>
        <World />
      </Suspense>
      <Title />
      <div className={photo || !started ? 'hidden' : undefined}>
        <UmbrellaOverlay />
        <Hud />
        <WorldLabels />
        <InteractHints />
        <HotspotList />
        <HoverTag />
        <Toast />
        <ScreenCard />
        <CameraRoll />
        <Notebook />
        <ScamCheck />
        <AegisCheck />
        <Constellations />
        <DialogueBox />
        <FlyerCard />
        <PageCard />
        <ChapterCard />
        <WalkNav />
        <PhoneButton />
        <UmbrellaButton />
        <Ending />
      </div>
      <Phone />
      <PhotoMode />
    </main>
  )
}

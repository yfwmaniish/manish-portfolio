import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { Object3D } from 'three'
import { useRef } from 'react'
import { useStore } from '../store/useStore'
import { Projector } from './Projector'
import { FrameDriver, CAM_Y, CAM_Z } from './FrameDriver'
import { PixelPipeline } from './render/PixelPipeline'
import { Sky } from './Sky'
import { Sea } from './Sea'
import { Skyline } from './Skyline'
import { Promenade } from './Promenade'
import { Rain } from './Rain'
import { Tetrapods } from './Tetrapods'
import { Lamps } from './Lamps'
import { Lighting } from './Lighting'
import { Ali } from './characters/Ali'
import { Cat } from './characters/Cat'
import { AliStanding } from './characters/AliStanding'
import { BalloonWala } from './characters/BalloonWala'
import { ChaiWala } from './characters/ChaiWala'
import { Signposts } from './Signposts'
import { AliBusStop } from './characters/AliBusStop'
import { UmbrellaWala } from './characters/UmbrellaWala'
import { BusStop } from './scene3/BusStop'
import { AliCafe } from './characters/AliCafe'
import { CopOnCycle } from './characters/CopOnCycle'
import { Cafe } from './scene4/Cafe'
import { Puddles } from './Puddles'
import { AliLying } from './characters/AliLying'
import { StrayDog } from './characters/StrayDog'
import { LaughterClub } from './characters/LaughterClub'
import { Boats } from './life/Boats'
import { Couples } from './life/Couples'
import { Crows } from './life/Crows'
import { Flyers } from './life/Flyers'
import { SeaLink } from './life/SeaLink'
import { SkyLife } from './life/SkyLife'
import { Spray } from './life/Spray'
import { Gust } from './pages/Gust'
import { Ambience } from './life/Ambience'
import { LocalTrain } from './life/LocalTrain'
import { InteractFX } from './fx/InteractFX'
import { BhuttaWala } from './stretch1/BhuttaWala'
import { BubbleKid } from './stretch1/BubbleKid'
import { Jogger } from './stretch1/Jogger'
import { MorseLamp } from './stretch2/MorseLamp'
import { OldCouple } from './stretch2/OldCouple'
import { Photographer } from './stretch2/Photographer'
import { JumpPuddle } from './stretch3/JumpPuddle'
import { PaperBoat } from './stretch3/PaperBoat'
import { Taxi } from './stretch3/Taxi'
import { Fisherman } from './stretch4/Fisherman'
import { NewspaperMan } from './stretch5/NewspaperMan'
import { ScenePages } from './pages/ScenePages'

export default function World() {
  return (
    <Canvas
      className="!fixed inset-0"
      dpr={Math.min(window.devicePixelRatio || 1, 3)}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      camera={{ fov: 30, near: 0.1, far: 1000, position: [0, CAM_Y, CAM_Z] }}
      // Clickable things live on several render layers; let pointer events see them all.
      onCreated={({ raycaster }) => raycaster.layers.enableAll()}
      aria-hidden="true"
    >
      <FrameDriver />
      <Lighting />

      {/* far away */}
      <Sky />
      <SkyLife />
      <Sea />
      <Skyline />
      <SeaLink />
      <LocalTrain />
      <Boats />

      {/* the promenade */}
      <Tetrapods />
      <Spray />
      <Promenade />
      <Lamps />

      {/* people and creatures */}
      <Ali />
      <ChaiWala />
      <Cat />
      <Gust />

      {/* on the way to Scene 2 */}
      <BhuttaWala />
      <BubbleKid />
      <Jogger />

      {/* Scene 2, 8:05 PM */}
      <AliStanding />
      <BalloonWala />
      <Signposts />

      {/* on the way to Scene 3 */}
      <OldCouple />
      <Photographer />
      <MorseLamp />

      {/* Scene 3, 9:40 PM */}
      <BusStop />
      <AliBusStop />
      <UmbrellaWala />
      <Puddles />

      {/* on the way to Scene 4 */}
      <PaperBoat />
      <JumpPuddle />
      <Taxi />
      <ScenePages />

      {/* Scene 4, 11:50 PM */}
      <Cafe />
      <AliCafe />
      <CopOnCycle />

      {/* on the way to Scene 5 */}
      <Fisherman />

      {/* Scene 5, 2:10 AM */}
      <AliLying />
      <StrayDog />

      {/* on the way to Scene 6 */}
      <NewspaperMan />

      {/* Scene 6, 5:48 AM */}
      <AliStanding id="ali6" x={140} faceSea backpack />
      <LaughterClub />
      <Couples />
      <Crows />
      <Flyers />
      <Ambience />
      <Rain />

      <InteractFX />
      <Projector />
      <ReadySignal />
      <PixelPipeline />
    </Canvas>
  )
}

/**
 * Compiles every shader in the city up front (all layers, hidden things too), then
 * tells the title card the city is drawn. Without this, things compile the first
 * time they come into view, and the frame stalls or flashes mid-walk.
 */
function ReadySignal() {
  const frames = useRef(0)
  const { gl, scene, camera } = useThree()
  useFrame(() => {
    frames.current++
    if (frames.current === 2) {
      const cam = camera.clone()
      cam.layers.enableAll()
      const hidden: Object3D[] = []
      scene.traverse((o) => {
        if (!o.visible) {
          hidden.push(o)
          o.visible = true
        }
      })
      gl.compile(scene, cam)
      hidden.forEach((o) => (o.visible = false))
    }
    if (frames.current === 4) useStore.setState({ worldReady: true })
  })
  return null
}

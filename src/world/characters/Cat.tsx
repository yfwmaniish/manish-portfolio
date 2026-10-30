import { sound } from '../../audio/bus'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { useAnchor } from '../../engine/anchors'
import { on } from '../../engine/events'
import { useInteractable } from '../../engine/interactables'
import { startTalk } from '../../engine/story'
import { useStore } from '../../store/useStore'
import { CAM_Z } from '../FrameDriver'
import { frame } from '../frame'
import { WALL_TOP } from '../Promenade'
import { SitPose, WalkPose, type CatRig } from './CatParts'
import { CharLayer, HitBox, useHearts, usePointerWorldX } from './shared'

const HOME_X = 3.2
const WALL_Z = -1.62
const FLOOR_Z = -0.55
const PET_SECONDS = 2.2
const HOP_SECONDS = 0.55
// When following, it trots to this far behind you and sits.
const TRAIL = 1.4

// What the indie "says" when scratched again later. DRAFT.
const PURRS = ['(wag wag wag)', '(leans into your hand)', 'boof.', '(rolls over for a belly rub)', '(happy sneeze)', '(wag wag)']

type Mode = 'wall' | 'hop' | 'sit' | 'walk'

/**
 * The promenade indie (a black street dog; the file keeps the template's name). Sits
 * on the sea wall watching your cursor until you scratch its ears (through the story),
 * then hops down and follows you along the promenade.
 */
export function Cat() {
  const root = useRef<Group>(null)
  const sit = useRef<Group>(null)
  const walk = useRef<Group>(null)
  const body = useRef<Group>(null)
  const rig: CatRig = {
    head: useRef<Group>(null),
    earL: useRef<Group>(null),
    earR: useRef<Group>(null),
    eyes: useRef<(Mesh | null)[]>([]),
    tail: useRef<(Group | null)[]>([]),
    legs: useRef<(Group | null)[]>([]),
  }
  const pointerX = usePointerWorldX()
  const hearts = useHearts()
  const eyeMat = useMemo(() => new MeshBasicMaterial({ color: '#C98A4A' }), [])
  const hovered = useStore((s) => s.hovered?.id === 'cat')
  const follows = useStore((s) => !!s.flags.cat_follows)
  const a = useRef({ mode: (follows ? 'sit' : 'wall') as Mode, x: HOME_X, y: WALL_TOP, z: WALL_Z, hop: 0, face: -1, pet: 0, blink: 2, twitch: 3, yaw: 1.2, stride: 0, side: -1 })

  const purr = (bubbleText: string | null) => {
    a.current.pet = PET_SECONDS
    const n = useStore.getState().petCat()
    hearts.burst(n === 1 ? 4 : 2 + (n % 2))
    if (bubbleText) useStore.getState().say('cat', bubbleText)
  }
  useEffect(() => on('pet', () => purr(null)), [])
  const label = useMemo(() => new Vector3(), [])
  useAnchor('marker-cat', () => label.set(a.current.x, a.current.y + 0.72, a.current.z))
  useAnchor('say-cat', () => label.set(a.current.x - 0.05, a.current.y + 0.62, a.current.z))

  const handlers = useInteractable({
    id: 'cat',
    label: follows ? 'Scratch the indie' : 'Say hi to the dog',
    x: () => a.current.x,
    onActivate: () => {
      if (follows) purr(PURRS[Math.min(useStore.getState().catPets, PURRS.length - 1)])
      else {
        sound('meow')
        startTalk('cat')
      }
    },
  })

  useFrame((_, dt) => {
    const c = a.current
    const s = useStore.getState()
    const t = frame.time
    c.pet = Math.max(0, c.pet - dt)
    const petting = c.pet > 0
    const inTalk = s.focus === 'cat'

    // where it wants to be
    if (follows && c.mode === 'wall' && !inTalk) {
      c.mode = 'hop'
      c.hop = 0
    }
    if (c.mode === 'hop') {
      c.hop += dt / HOP_SECONDS
      const u = Math.min(1, c.hop)
      c.y = MathUtils.lerp(WALL_TOP, 0, u) + Math.sin(u * Math.PI) * 0.35
      c.z = MathUtils.lerp(WALL_Z, FLOOR_Z, u)
      if (u >= 1) c.mode = 'sit'
    } else if (c.mode === 'sit' || c.mode === 'walk') {
      if (frame.speed > 0.5) c.side = Math.sign(s.walkTarget - frame.camX) > 0 ? -1 : 1
      const target = frame.camX + c.side * TRAIL
      const gap = target - c.x
      if (c.mode === 'sit' && Math.abs(gap) > 0.9 && !petting && !inTalk) c.mode = 'walk'
      if (c.mode === 'walk') {
        const speed = Math.min(3.2, Math.abs(gap) * 2.4 + 0.6)
        c.x += Math.sign(gap) * Math.min(Math.abs(gap), speed * dt)
        c.face = Math.sign(gap) || c.face
        c.stride += dt * speed * 9
        if (Math.abs(gap) < 0.15) c.mode = 'sit'
      }
      c.y = 0
      c.z = FLOOR_Z
    }
    frame.catX = c.x
    root.current?.position.set(c.x, c.y, c.z)

    const walking = c.mode === 'walk'
    if (sit.current) sit.current.visible = !walking
    if (walk.current) {
      walk.current.visible = walking
      walk.current.rotation.y = c.face > 0 ? Math.PI : 0
      walk.current.position.y = Math.abs(Math.sin(c.stride)) * 0.02
    }
    rig.legs.current.forEach((l, i) => l && (l.rotation.z = Math.sin(c.stride + (i % 3 === 0 ? 0 : Math.PI)) * 0.6))

    // head follows the pointer, can't quite look backwards
    const dx = pointerX(c.z) - c.x
    const look = MathUtils.clamp(Math.atan2(CAM_Z - c.z, -dx), 0.25, 2.5)
    c.yaw = MathUtils.damp(c.yaw, petting || inTalk ? 1.3 : look, petting ? 3 : 5, dt)
    if (rig.head.current) {
      rig.head.current.rotation.y = c.yaw
      rig.head.current.rotation.x = MathUtils.damp(rig.head.current.rotation.x, petting ? Math.sin(t * 3) * 0.25 : 0, 6, dt)
      rig.head.current.rotation.z = MathUtils.damp(rig.head.current.rotation.z, petting ? -0.2 : 0, 6, dt)
    }

    // breathing, and a happy wiggle when scratched
    if (body.current) {
      body.current.scale.y = 1 + Math.sin(t * 2.2) * 0.02
      body.current.position.x = petting ? Math.sin(t * 90) * 0.004 : 0
    }

    // blinks; eyes squeeze shut while petted
    c.blink -= dt
    if (c.blink < -0.12) c.blink = 1.5 + Math.random() * 3.5
    const open = petting ? 0.2 : c.blink < 0 ? 0.15 : 1
    rig.eyes.current.forEach((e) => e && (e.scale.y = open))

    // ears: one twitches now and then, both perk up on hover, flatten a touch when petted
    c.twitch -= dt
    if (c.twitch < -0.15) c.twitch = 2 + Math.random() * 4
    const perk = hovered ? -0.25 : petting ? 0.35 : 0
    if (rig.earL.current) rig.earL.current.rotation.x = perk + (c.twitch < 0 ? -0.5 : 0)
    if (rig.earR.current) rig.earR.current.rotation.x = -perk

    // tail
    rig.tail.current.forEach((seg, i) => {
      if (!seg) return
      // an indie's tail: curled up over the back, wagging hard when scratched
      const speed = petting ? 14 : 2
      seg.rotation.z = 0.42 + Math.sin(t * speed - i * 0.5) * (petting ? 0.18 : 0.06)
    })
  })

  return (
    <group ref={root} position={[HOME_X, WALL_TOP, WALL_Z]}>
      <CharLayer>
        <group ref={body}>
          <group ref={sit}>
            <SitPose rig={rig} eyeMat={eyeMat} />
          </group>
          <group ref={walk} visible={false}>
            <WalkPose legs={rig.legs} eyeMat={eyeMat} />
          </group>
        </group>
        <group position={[-0.05, 0.42, 0]}>{hearts.node}</group>
      </CharLayer>

      <HitBox size={[0.55, 0.6, 0.5]} position={[0, 0.25, 0]} {...handlers} />

    </group>
  )
}

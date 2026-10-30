import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, DoubleSide, Group, MeshToonMaterial, NearestFilter, SRGBColorSpace } from 'three'
import { FLYERS, type Flyer } from '../../data/flyers'
import { useInteractable } from '../../engine/interactables'
import { useStore } from '../../store/useStore'
import { CharLayer, HitBox } from '../characters/shared'
import { blocksCloseUp, frame } from '../frame'
import { ramp } from '../materials'

const SLOTS = 2
const HOVER_SLOWDOWN = 0.12

/** A tiny 12×16 pixel flyer: coloured header, a picture block, scribbled lines. */
function flyerTexture(f: Flyer) {
  const c = document.createElement('canvas')
  c.width = 12
  c.height = 16
  const g = c.getContext('2d')!
  g.fillStyle = f.paper
  g.fillRect(0, 0, 12, 16)
  g.fillStyle = f.band
  g.fillRect(0, 0, 12, 4)
  g.fillStyle = f.paper
  g.fillRect(2, 1, 8, 1)
  g.fillStyle = f.band
  g.fillRect(2, 5, 4, 4)
  g.fillStyle = f.ink
  for (const [x, y, w] of [[7, 5, 3], [7, 7, 3], [2, 10, 8], [2, 12, 6], [2, 14, 7]]) g.fillRect(x, y, w, 1)
  const t = new CanvasTexture(c)
  t.magFilter = t.minFilter = NearestFilter
  t.colorSpace = SRGBColorSpace
  return t
}

export function Flyers() {
  const materials = useMemo(
    () =>
      FLYERS.map(
        (f) => new MeshToonMaterial({ map: flyerTexture(f), gradientMap: ramp, side: DoubleSide }),
      ),
    [],
  )
  return (
    <>
      {Array.from({ length: SLOTS }, (_, i) => (
        <FlyerSlot key={i} slot={i} materials={materials} />
      ))}
    </>
  )
}

interface Flight {
  which: number
  x: number
  z: number
  phase: number
  speed: number
  t: number
  /** Seconds until it appears; negative means in the air. */
  wait: number
}

function launch(f: Flight, slot: number) {
  // Pick a flyer the other slot isn't showing, prefer ones not caught yet.
  const caught = useStore.getState().flyersCaught
  const pool = FLYERS.map((_, i) => i).filter((i) => i !== f.which && !caught.includes(FLYERS[i].id))
  const choices = pool.length ? pool : FLYERS.map((_, i) => i).filter((i) => i !== f.which)
  f.which = choices[Math.floor(Math.random() * choices.length)]
  f.x = frame.camX - 9 - Math.random() * 3
  f.z = -0.9 + Math.random() * 3
  f.phase = Math.random() * 10 + slot * 3
  f.speed = 1.1 + Math.random() * 0.7
  f.t = 0
}

function FlyerSlot({ slot, materials }: { slot: number; materials: MeshToonMaterial[] }) {
  const group = useRef<Group>(null)
  const paper = useRef<Group>(null)
  const flight = useRef<Flight>({ which: slot, x: 0, z: 0, phase: 0, speed: 1, t: 0, wait: 2 + slot * 6 })
  const [inAir, setInAir] = useState(false)
  const [which, setWhich] = useState(slot)
  const id = `flyer-${slot}`
  const hovered = useStore((s) => s.hovered?.id === id)

  const handlers = useInteractable({
    id,
    label: 'Catch the flyer',
    x: () => flight.current.x,
    enabled: inAir,
    onActivate: () => {
      useStore.getState().catchFlyer(FLYERS[flight.current.which].id)
      flight.current.wait = 6 + Math.random() * 8
      setInAir(false)
    },
  })

  useFrame((_, dt) => {
    const f = flight.current
    if (!inAir) {
      if (group.current) group.current.visible = false
      f.wait -= dt
      if (f.wait <= 0) {
        launch(f, slot)
        setWhich(f.which)
        setInAir(true)
      }
      return
    }
    const step = dt * (hovered ? HOVER_SLOWDOWN : 1)
    f.t += step
    const gust = 0.6 + 0.4 * Math.sin(f.t * 0.7 + f.phase)
    f.x += f.speed * gust * step
    if (f.x > frame.camX + 11 || f.x < frame.camX - 16) {
      f.wait = 2 + Math.random() * 6
      setInAir(false)
      return
    }
    const y = Math.max(0.12, 0.95 + 0.55 * Math.sin(f.t * 0.6 + f.phase) + 0.15 * Math.sin(f.t * 3.1 + f.phase))
    group.current?.position.set(f.x, y, f.z)
    if (group.current) group.current.visible = !blocksCloseUp(f.x, f.z)
    if (paper.current) {
      paper.current.rotation.set(
        Math.sin(f.t * 2.3 + f.phase) * 1.1,
        f.t * 1.4 + f.phase,
        Math.sin(f.t * 1.7 + f.phase) * 0.6,
      )
    }
  })

  return (
    <group ref={group} visible={false}>
      <CharLayer>
        <group ref={paper}>
          <mesh material={materials[which]}>
            <planeGeometry args={[0.24, 0.32]} />
          </mesh>
        </group>
      </CharLayer>
      {inAir && <HitBox size={[0.45, 0.5, 0.3]} {...handlers} />}
    </group>
  )
}

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils, Mesh, Vector3 } from 'three'
import { useAnchor } from '../../engine/anchors'
import { on } from '../../engine/events'
import { useInteractable } from '../../engine/interactables'
import { startTalk } from '../../engine/story'
import { useStore } from '../../store/useStore'
import { CAM_Z } from '../FrameDriver'
import { frame } from '../frame'
import { toon } from '../materials'
import { ChaiCart } from './ChaiCart'
import { ChaiGlass } from './ChaiGlass'
import { useFace } from './faces'
import { CharLayer, HitBox, usePointerWorldX } from './shared'
import { KURTA, SKIN, VendorHead } from './VendorHead'

export const VENDOR_X = -4.6
const CART_Z = -0.75
const POUR_SECONDS = 2.6
// Kettle positions, relative to the cart: on the stove, and tipped over the glass.
const KETTLE_REST = [-0.32, 1.06, -0.05] as const
const KETTLE_POUR = [0.06, 1.22, 0.1] as const
const GLASS_AT = [0.2, 0.86, 0.14] as const

/** The chai wala behind his cart: wipes the counter, watches you, pours when asked. */
export function ChaiWala() {
  const head = useRef<Group>(null)
  const wipeArm = useRef<Group>(null)
  const pourArm = useRef<Group>(null)
  const kettle = useRef<Group>(null)
  const stream = useRef<Mesh>(null)
  const fresh = useRef<Group>(null)
  const pointerX = usePointerWorldX()
  const face = useFace('Chai wala')
  const anim = useRef({ pour: 0, yaw: 0 })
  const markerAt = useMemo(() => new Vector3(VENDOR_X, 2.25, CART_Z - 0.48), [])
  useAnchor('marker-vendor', () => markerAt)
  const bought = useStore((s) => !!s.flags.chai_bought)

  useEffect(() => on('pour', () => (anim.current.pour = POUR_SECONDS)), [])

  const handlers = useInteractable({
    id: 'vendor',
    label: 'Talk to the chai wala',
    x: () => VENDOR_X,
    onActivate: () => startTalk('vendor'),
  })

  useFrame((_, dt) => {
    const a = anim.current
    const t = frame.time
    a.pour = Math.max(0, a.pour - dt)
    const u = 1 - a.pour / POUR_SECONDS // 0 → 1 across the pour
    const pouring = a.pour > 0

    // where the kettle is: up and over (0–0.25), tipped (0.25–0.7), back (0.7–1)
    const lift = pouring ? (u < 0.25 ? u / 0.25 : u < 0.7 ? 1 : 1 - (u - 0.7) / 0.3) : 0
    const ease = lift * lift * (3 - 2 * lift)
    const tip = pouring && u > 0.25 && u < 0.7 ? Math.sin(((u - 0.25) / 0.45) * Math.PI) : 0
    if (kettle.current) {
      kettle.current.position.set(
        MathUtils.lerp(KETTLE_REST[0], KETTLE_POUR[0], ease),
        MathUtils.lerp(KETTLE_REST[1], KETTLE_POUR[1], ease) + Math.sin(ease * Math.PI) * 0.1,
        MathUtils.lerp(KETTLE_REST[2], KETTLE_POUR[2], ease),
      )
      kettle.current.rotation.z = -tip * 0.9
    }
    if (stream.current) stream.current.visible = tip > 0.35
    if (fresh.current) {
      fresh.current.visible = pouring || bought
      // once poured, the glass slides to the front of the counter for you
      const slide = pouring ? Math.max(0, (u - 0.75) / 0.25) : 1
      fresh.current.position.set(GLASS_AT[0] + slide * 0.18, GLASS_AT[1], GLASS_AT[2] + slide * 0.14)
    }

    // pouring arm follows the kettle; the other one wipes the counter
    if (pourArm.current) pourArm.current.rotation.x = -0.3 - ease * 0.9
    if (wipeArm.current) {
      wipeArm.current.rotation.x = -1.1
      wipeArm.current.rotation.z = pouring ? 0 : Math.sin(t * 2.4) * 0.35
    }

    // watches your cursor, or the glass while pouring
    const dx = pointerX(CART_Z) - VENDOR_X
    const target = pouring ? 0.5 : MathUtils.clamp(Math.atan2(dx, CAM_Z - CART_Z) * 1.4, -0.8, 0.8)
    a.yaw = MathUtils.damp(a.yaw, target, 4, dt)
    if (head.current) {
      head.current.rotation.y = a.yaw
      head.current.rotation.x = pouring ? 0.3 : 0
      head.current.position.y = 1.5 + Math.sin(t * 1.7) * 0.004
    }
  })

  return (
    <group>
      <ChaiCart x={VENDOR_X} z={CART_Z} />
      <group position={[VENDOR_X, 0, CART_Z]}>
        <CharLayer position={[0, 0, -0.48]}>
          {/* legs, mostly hidden by the cart; a kurta that flares a little */}
          <mesh material={toon('#3A3048')} position={[0, 0.4, 0]}>
            <capsuleGeometry args={[0.13, 0.55, 4, 8]} />
          </mesh>
          <mesh material={toon(KURTA)} position={[0, 1.02, 0]} scale={[1, 1, 0.72]}>
            <cylinderGeometry args={[0.18, 0.23, 0.64, 12]} />
          </mesh>
          <mesh material={toon(KURTA)} position={[0, 1.33, 0]} scale={[1.1, 0.5, 0.72]}>
            <sphereGeometry args={[0.19, 12, 8]} />
          </mesh>
          {/* gamchha draped over his right shoulder */}
          <mesh material={toon('#C0504A')} position={[-0.15, 1.24, 0.02]} rotation-z={0.15}>
            <capsuleGeometry args={[0.05, 0.28, 4, 8]} />
          </mesh>
          <mesh material={toon(SKIN)} position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.055, 0.06, 0.08, 8]} />
          </mesh>
          <group ref={head} position={[0, 1.5, 0]}>
            <VendorHead face={face} />
          </group>
          {/* arms: his left wipes, his right pours */}
          <group ref={wipeArm} position={[0.21, 1.3, 0]}>
            <mesh material={toon(KURTA)} position={[0, -0.18, 0]}>
              <capsuleGeometry args={[0.05, 0.28, 4, 8]} />
            </mesh>
            <mesh material={toon(SKIN)} position={[0, -0.38, 0]}>
              <sphereGeometry args={[0.042, 8, 6]} />
            </mesh>
            <mesh material={toon('#F7EAD7')} position={[0, -0.43, 0.02]} scale={[1.4, 0.35, 1]}>
              <sphereGeometry args={[0.06, 8, 6]} />
            </mesh>
          </group>
          <group ref={pourArm} position={[-0.21, 1.3, 0]} rotation-z={-0.25}>
            <mesh material={toon(KURTA)} position={[0, -0.18, 0]}>
              <capsuleGeometry args={[0.05, 0.28, 4, 8]} />
            </mesh>
            <mesh material={toon(SKIN)} position={[0, -0.38, 0]}>
              <sphereGeometry args={[0.042, 8, 6]} />
            </mesh>
          </group>
        </CharLayer>

        {/* the kettle, the chai stream, the glass he pours for you */}
        <CharLayer>
          <group ref={kettle} position={[...KETTLE_REST]}>
            <mesh material={toon('#C9B8D6')} scale={[1, 0.85, 1]}>
              <sphereGeometry args={[0.085, 10, 8]} />
            </mesh>
            <mesh material={toon('#9A8FB0')} position={[0, 0.075, 0]}>
              <cylinderGeometry args={[0.03, 0.045, 0.03, 8]} />
            </mesh>
            <mesh material={toon('#9A8FB0')} position={[0.1, 0.02, 0]} rotation-z={-1.0}>
              <cylinderGeometry args={[0.012, 0.02, 0.09, 6]} />
            </mesh>
          </group>
          <mesh ref={stream} material={toon('#C88A3C')} position={[GLASS_AT[0], 1.04, GLASS_AT[2]]} visible={false}>
            <boxGeometry args={[0.015, 0.3, 0.015]} />
          </mesh>
        </CharLayer>
        <group ref={fresh} visible={bought}>
          <ChaiGlass level={0.85} />
        </group>
      </group>

      <HitBox size={[1.5, 2.0, 1.2]} position={[VENDOR_X, 1.0, CART_Z - 0.1]} {...handlers} />
    </group>
  )
}

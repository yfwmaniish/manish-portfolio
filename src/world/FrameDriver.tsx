import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Euler, MathUtils, PerspectiveCamera, Quaternion, Vector3, Matrix4 } from 'three'
import { pAt } from '../data/scenes'
import { focusCamera } from '../engine/focus'
import { timeOfDay } from '../lib/time'
import { effectiveP, useStore } from '../store/useStore'
import { frame } from './frame'

// Side-on framing: camera stands back from the promenade, looking out to sea.
export const CAM_Z = 11
export const CAM_Y = 2.3
const LOOK_Y = 1.45
// Snap to the pixel grid of the plane where the wall and characters live, so they
// move in whole pixels instead of crawling.
const FOCAL_Z = -1.5
// On tall screens (phones), open the lens up so you still see a stretch of promenade.
const BASE_FOV = 30
const MIN_HALF_WIDTH = MathUtils.degToRad(15)

/** Runs first every frame: updates time of night, walks the camera, and moves in for close-ups. */
export function FrameDriver() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  // Fixed viewing direction; the camera only ever translates.
  const rotation = useMemo(() => {
    const m = new Matrix4().lookAt(new Vector3(0, CAM_Y, CAM_Z), new Vector3(0, LOOK_Y, 0), new Vector3(0, 1, 0))
    return new Quaternion().setFromRotationMatrix(m)
  }, [])
  const state = useMemo(() => ({ x: useStore.getState().walkTarget, y: CAM_Y, z: CAM_Z, px: 0, py: 0, pitch: 0 }), [])
  const tilt = useMemo(() => ({ q: new Quaternion(), e: new Euler() }), [])

  useFrame((_, dt) => {
    const fov = Math.max(BASE_FOV, MathUtils.radToDeg(2 * Math.atan(Math.tan(MIN_HALF_WIDTH) / camera.aspect)))
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }

    const s = useStore.getState()
    const step = Math.min(dt, 0.1)
    frame.time += step
    frame.tod = timeOfDay(effectiveP(s))

    const moving = s.motion && !reduced
    const target = s.focus ? focusCamera(s.focus) : { x: s.walkTarget, y: CAM_Y, z: CAM_Z }
    const prev = state.x
    // a close-up glides in a little slower than walking
    const rate = s.focus ? 2.4 : 3
    state.x = moving ? MathUtils.damp(state.x, target.x, rate, step) : target.x
    state.y = moving ? MathUtils.damp(state.y, target.y, rate, step) : target.y
    state.z = moving ? MathUtils.damp(state.z, target.z, rate, step) : target.z
    const pitch = 'pitch' in target ? (target.pitch ?? 0) : 0
    state.pitch = moving ? MathUtils.damp(state.pitch, pitch, 2, step) : pitch
    // Walking is the night passing: the clock follows where you are on the promenade.
    if (!s.focus) {
      const p = pAt(state.x)
      if (Math.abs(p - s.p) > 0.0008) useStore.setState({ p })
    }
    const v = Math.abs(state.x - prev) / Math.max(step, 1e-3)
    frame.speed = frame.speed * 0.85 + (s.focus ? 0 : v) * 0.15

    // Pointer gives a little parallax, eased so it never snaps; less of it up close.
    const sway = s.focus ? 0.25 : 1
    state.px = MathUtils.damp(state.px, moving ? s.pointer.x * sway : 0, 4, step)
    state.py = MathUtils.damp(state.py, moving ? s.pointer.y * sway : 0, 4, step)
    const bob = moving ? Math.sin(frame.time * 9) * Math.min(frame.speed * 0.006, 0.04) : 0

    const depth = Math.max(0.5, state.z - FOCAL_Z)
    const unit = frame.envPixelPx * 2 * depth * Math.tan(MathUtils.degToRad(camera.fov / 2))
    const snap = (n: number) => Math.round(n / unit) * unit
    const x = snap(state.x + state.px * 0.4)
    const y = snap(state.y + bob - state.py * 0.15)
    frame.camX = x
    frame.closeUp = !!s.focus
    camera.position.set(x, y, state.z)
    camera.quaternion.copy(rotation).multiply(tilt.q.setFromEuler(tilt.e.set(state.pitch, 0, 0)))
  }, -1)

  return null
}

import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  WebGLRenderTarget,
} from 'three'
import { frame, LAYER_CHAR, LAYER_ENV, LAYER_FX } from '../frame'
import { makeCompositeMaterial } from './composite'

// Aim for roughly this many world pixels from top to bottom of the screen.
const TARGET_ROWS = 320

/**
 * Whole-number pixel sizes, in physical screen pixels, so every world pixel is
 * exactly the same size on screen. Characters get a finer grid than the world.
 */
export function pixelScales(physicalHeight: number) {
  const env = Math.max(2, Math.round(physicalHeight / TARGET_ROWS))
  const chars = Math.max(1, Math.min(env - 1, Math.round(env / 2)))
  return { env, chars }
}

function makeTarget() {
  const rt = new WebGLRenderTarget(1, 1, { depthBuffer: true })
  rt.texture.minFilter = NearestFilter
  rt.texture.magFilter = NearestFilter
  rt.texture.generateMipmaps = false
  return rt
}

/**
 * Takes over rendering. Each frame:
 * 1. world (+ glows) into a coarse target,
 * 2. world as depth only, then characters, into a finer target,
 *    so foreground props still hide characters correctly,
 * 3. both composited to the screen at whole-pixel scale.
 * Targets are rounded up to whole pixels; a view offset keeps both layers
 * lined up with the screen exactly.
 */
export function PixelPipeline() {
  const { gl, scene, camera, size, viewport } = useThree()

  const res = useMemo(() => {
    const env = makeTarget()
    const chars = makeTarget()
    const material = makeCompositeMaterial(env.texture, chars.texture)
    const quad = new Mesh(new PlaneGeometry(2, 2), material)
    quad.frustumCulled = false
    const screen = new Scene()
    screen.add(quad)
    const depthOnly = new MeshBasicMaterial({ colorWrite: false })
    const layout = { pw: 1, ph: 1, env: { w: 1, h: 1, s: 2 }, chars: { w: 1, h: 1, s: 1 } }
    return { env, chars, material, screen, ortho: new OrthographicCamera(), depthOnly, layout }
  }, [])

  useEffect(() => {
    const pw = Math.round(size.width * viewport.dpr)
    const ph = Math.round(size.height * viewport.dpr)
    const scales = pixelScales(ph)
    const L = res.layout
    L.pw = pw
    L.ph = ph
    L.env = { w: Math.ceil(pw / scales.env), h: Math.ceil(ph / scales.env), s: scales.env }
    L.chars = { w: Math.ceil(pw / scales.chars), h: Math.ceil(ph / scales.chars), s: scales.chars }
    res.env.setSize(L.env.w, L.env.h)
    res.chars.setSize(L.chars.w, L.chars.h)
    const u = res.material.uniforms
    u.uEnvSize.value.set(L.env.w, L.env.h)
    u.uCharSize.value.set(L.chars.w, L.chars.h)
    u.uEnvScale.value = L.env.s
    u.uCharScale.value = L.chars.s
    frame.envPixelPx = L.env.s / ph
  }, [size, viewport.dpr, res])

  useEffect(
    () => () => {
      res.env.dispose()
      res.chars.dispose()
      res.material.dispose()
      res.depthOnly.dispose()
    },
    [res],
  )

  useFrame(() => {
    const cam = camera as PerspectiveCamera
    const L = res.layout
    // Each target covers a whole number of pixels, anchored bottom-left, so it can
    // overhang the screen at the top and right. Crop the frustum to match.
    const aim = (t: { w: number; h: number; s: number }) => {
      cam.setViewOffset(L.pw, L.ph, 0, L.ph - t.h * t.s, t.w * t.s, t.h * t.s)
    }
    const autoClear = gl.autoClear
    gl.autoClear = false

    // 1. the world
    aim(L.env)
    cam.layers.set(LAYER_ENV)
    cam.layers.enable(LAYER_FX)
    gl.setRenderTarget(res.env)
    gl.setClearColor(0x070617, 1)
    gl.clear()
    gl.render(scene, cam)

    // 2. characters, occluded by the world's depth
    aim(L.chars)
    gl.setRenderTarget(res.chars)
    gl.setClearColor(0x000000, 0)
    gl.clear()
    cam.layers.set(LAYER_ENV)
    scene.overrideMaterial = res.depthOnly
    gl.render(scene, cam)
    scene.overrideMaterial = null
    cam.layers.set(LAYER_CHAR)
    gl.render(scene, cam)

    // 3. to the screen
    gl.setRenderTarget(null)
    gl.clear()
    gl.render(res.screen, res.ortho)

    // Leave the camera normal for pointer raycasting between frames.
    cam.clearViewOffset()
    cam.layers.set(LAYER_ENV)
    gl.autoClear = autoClear
  }, 1)

  return null
}

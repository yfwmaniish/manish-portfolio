import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Group, InstancedMesh, MeshBasicMaterial, Object3D, ShaderMaterial } from 'three'
import { frame } from './frame'
import { SEA_Y } from './Sea'

// Far shore across the bay. Moves almost with the camera, so it reads as very far away.
const PARALLAX = 0.88

// Seeded so the skyline is the same on every visit.
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

interface Box { x: number; z: number; w: number; h: number; d: number }

function buildTowers(): Box[] {
  const r = rng(7)
  const out: Box[] = []
  // Nariman Point to the left (south), Malabar Hill to the right (north).
  for (let x = -140; x < -50; x += 2.5 + r() * 3) out.push({ x, z: -150 - r() * 30, w: 2 + r() * 2.5, h: 3 + r() * 9, d: 3 })
  for (let x = 45; x < 160; x += 2.5 + r() * 3.5) {
    const hill = Math.max(0, 1 - Math.abs(x - 110) / 60) * 5
    out.push({ x, z: -170 - r() * 30, w: 2 + r() * 2.5, h: hill + 3 + r() * 8, d: 3 })
  }
  return out
}

// The Queen's Necklace: the promenade's own lamps curving round the bay on both sides.
function necklacePoints() {
  const pts: [number, number, number][] = []
  for (let t = 0; t <= 1; t += 0.03) {
    const a = t * t
    pts.push([25 + a * 60, SEA_Y + 2.2, -60 - t * 120])
    pts.push([-25 - a * 60, SEA_Y + 2.2, -60 - t * 100])
  }
  return pts
}

export function Skyline() {
  const group = useRef<Group>(null)
  const towers = useRef<InstancedMesh>(null)
  const beads = useRef<InstancedMesh>(null)
  const boxes = useMemo(buildTowers, [])
  const pts = useMemo(necklacePoints, [])

  const mats = useMemo(
    () => ({
      tower: new ShaderMaterial({
        uniforms: { uFill: { value: new Color() }, uWin: { value: new Color('#FFC56B') }, uLights: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec3 vLocal;
          varying float vSeed;
          void main() {
            vLocal = (instanceMatrix * vec4(position, 1.0)).xyz;
            vSeed = instanceMatrix[3].x;
            gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uFill;
          uniform vec3 uWin;
          uniform float uLights;
          varying vec3 vLocal;
          varying float vSeed;
          float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          void main() {
            vec2 cell = floor(vec2(vLocal.x * 0.9, vLocal.y * 0.8));
            vec2 f = fract(vec2(vLocal.x * 0.9, vLocal.y * 0.8));
            float on = step(0.55, hash(cell + vSeed)) * step(0.35, f.x) * step(0.4, f.y) * step(vLocal.y, ${(SEA_Y + 30).toFixed(1)});
            gl_FragColor = vec4(mix(uFill, uWin, on * uLights * 0.9), 1.0);
          }
        `,
      }),
      bead: new MeshBasicMaterial({ color: '#FFC56B', transparent: true }),
    }),
    [],
  )

  useLayoutEffect(() => {
    const o = new Object3D()
    boxes.forEach((b, i) => {
      o.position.set(b.x, SEA_Y + b.h / 2, b.z)
      o.scale.set(b.w, b.h, b.d)
      o.updateMatrix()
      towers.current!.setMatrixAt(i, o.matrix)
    })
    towers.current!.instanceMatrix.needsUpdate = true
    o.scale.set(1, 1, 1)
    pts.forEach((p, i) => {
      o.position.set(...p)
      o.updateMatrix()
      beads.current!.setMatrixAt(i, o.matrix)
    })
    beads.current!.instanceMatrix.needsUpdate = true
  }, [boxes, pts])

  const dusk = useMemo(() => new Color('#3A2550'), [])
  const night = useMemo(() => new Color('#100E26'), [])
  const dawn = useMemo(() => new Color('#3C4470'), [])

  useFrame(() => {
    const { tod, camX } = frame
    if (group.current) group.current.position.x = camX * PARALLAX
    const fill = mats.tower.uniforms.uFill.value as Color
    // Prototype farFill: dusk → night, then night → dawn.
    if (tod.dawn > 0) fill.copy(night).lerp(dawn, tod.dawn)
    else fill.copy(dusk).lerp(night, tod.night)
    mats.tower.uniforms.uLights.value = tod.lights
    mats.bead.opacity = 0.15 + tod.lights * 0.85
  })

  return (
    <group ref={group}>
      <instancedMesh ref={towers} args={[undefined, mats.tower, boxes.length]} frustumCulled={false}>
        <boxGeometry />
      </instancedMesh>
      <instancedMesh ref={beads} args={[undefined, mats.bead, pts.length]} frustumCulled={false}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
      </instancedMesh>
    </group>
  )
}

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Mesh, ShaderMaterial } from 'three'

const RAIN_GREY = new Color('#2B3050')
import { ss, sunX } from '../lib/time'
import { skyBand } from '../lib/palette'
import { frame } from './frame'

const SKY_Z = -320
// World height that maps onto the prototype's 190-unit sky.
const SKY_H = 78

const fragmentShader = /* glsl */ `
  uniform vec3 uBands[9];
  uniform float uTime;
  uniform vec2 uSun;      // world offset from camera, y = centre height
  uniform vec2 uMoon;
  uniform float uStars;
  uniform float uClouds;
  uniform float uNight;
  uniform float uCamX;
  varying vec3 vWorld;

  // Colours below are written in sRGB; the pipeline works in linear.
  vec3 L(vec3 c) { return pow(c, vec3(2.2)); }

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) { return noise(p) * 0.6 + noise(p * 2.1) * 0.3 + noise(p * 4.3) * 0.1; }

  vec3 band(float y) {
    float t = (1.0 - clamp(y / ${SKY_H.toFixed(1)}, 0.0, 1.0)) * 190.0;
    if (t < 30.0) return uBands[0];
    if (t < 55.0) return uBands[1];
    if (t < 80.0) return uBands[2];
    if (t < 105.0) return uBands[3];
    if (t < 125.0) return uBands[4];
    if (t < 145.0) return uBands[5];
    if (t < 162.0) return uBands[6];
    if (t < 177.0) return uBands[7];
    return uBands[8];
  }

  // Chunky "pixel circle": a square with its corners clipped.
  float blob(vec2 d, float r) {
    vec2 a = abs(d);
    return step(max(a.x, a.y), r) * step(a.x + a.y, r * 1.45);
  }

  void main() {
    // Sky sits at "infinity": measure x relative to the camera.
    vec2 q = vec2(vWorld.x - uCamX, vWorld.y);
    vec3 col = band(q.y);

    // clouds: stretched noise, two tones, sitting in the warm bands
    float cn = fbm(vec2(q.x * 0.025 + uTime * 0.004, q.y * 0.11));
    float cmask = smoothstep(0.6, 0.62, cn) * smoothstep(18.0, 26.0, q.y) * (1.0 - smoothstep(48.0, 58.0, q.y));
    vec3 cloud = mix(L(vec3(0.66, 0.33, 0.44)), L(vec3(0.85, 0.47, 0.54)), step(0.7, cn));
    cloud = mix(cloud, uBands[2] * 1.4, uNight);
    col = mix(col, cloud, cmask * uClouds);

    // stars
    vec2 cell = floor(q * 0.45);
    float h = hash(cell);
    vec2 inCell = fract(q * 0.45);
    float star = step(0.975, h) * step(length(inCell - 0.5), 0.2);
    float tw = 0.55 + 0.45 * sin(uTime * (1.5 + h * 3.0) + h * 40.0);
    col += L(vec3(0.97, 0.92, 0.84)) * star * tw * uStars * smoothstep(14.0, 30.0, q.y);

    // moon + glow
    vec2 md = q - uMoon;
    col = mix(col, L(vec3(0.96, 0.92, 0.82)), blob(md, 3.2 * 1.6) * 0.06 * uStars);
    col = mix(col, L(vec3(0.96, 0.92, 0.82)), blob(md, 3.2));
    col = mix(col, L(vec3(0.85, 0.80, 0.67)), blob(md - vec2(-0.9, 0.8), 0.9) * blob(md, 3.2));

    // sun + stepped halo
    vec2 sd = q - uSun;
    col = mix(col, L(vec3(1.0, 0.82, 0.54)), blob(sd, 13.0) * 0.14);
    col = mix(col, L(vec3(1.0, 0.82, 0.54)), blob(sd, 9.5) * 0.18);
    col = mix(col, L(vec3(1.0, 0.77, 0.42)), blob(sd, 6.6));
    col = mix(col, L(vec3(1.0, 0.89, 0.66)), blob(sd - vec2(-1.6, 2.6), 1.6) * blob(sd, 6.6));

    gl_FragColor = vec4(col, 1.0);
  }
`

export function Sky() {
  const mesh = useRef<Mesh>(null)
  const material = useMemo(
    () =>
      new ShaderMaterial({
        depthWrite: false,
        uniforms: {
          uBands: { value: Array.from({ length: 9 }, () => new Color()) },
          uTime: { value: 0 },
          uSun: { value: [0, 0] },
          uMoon: { value: [0, 0] },
          uStars: { value: 0 },
          uClouds: { value: 1 },
          uNight: { value: 0 },
          uCamX: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vWorld;
          void main() {
            vec4 w = modelMatrix * vec4(position, 1.0);
            vWorld = w.xyz;
            gl_Position = projectionMatrix * viewMatrix * w;
          }
        `,
        fragmentShader,
      }),
    [],
  )

  useFrame(() => {
    const { tod, camX, time } = frame
    const u = material.uniforms
    u.uBands.value.forEach((c: Color, i: number) => skyBand(c, i, tod).lerp(RAIN_GREY, tod.rain * 0.55))
    u.uTime.value = time
    u.uCamX.value = camX
    u.uNight.value = tod.night
    u.uStars.value = tod.night * 0.95 + tod.dawn * 0.15
    u.uClouds.value = Math.min(1, 1 - tod.night * 0.7 + tod.rain)
    // Prototype: sun sinks 72 of 190 units by p 0.3; at dawn it rose 46. Here it rises
    // 64, so it's properly half up over the sea by Scene 6.
    const sunY190 = 170 + 72 * ss(0, 0.3, tod.p) - 64 * tod.dawn
    u.uSun.value = [sunX(tod), (1 - sunY190 / 190) * SKY_H]
    const moonY190 = 52 + 170 * (1 - ss(0.22, 0.62, tod.p)) + 170 * ss(0.8, 0.97, tod.p)
    u.uMoon.value = [-70, (1 - moonY190 / 190) * SKY_H]
    if (mesh.current) mesh.current.position.x = camX
  })

  return (
    <mesh ref={mesh} position={[0, 160, SKY_Z]} material={material} renderOrder={-10}>
      <planeGeometry args={[900, 420]} />
    </mesh>
  )
}

import { ShaderMaterial, Texture, Vector2 } from 'three'

// Final pass: puts the coarse world and the finer character layer on screen. Each
// world pixel is exactly uEnvScale physical pixels (and each character pixel
// uCharScale), measured from the bottom-left of the screen. Converts to sRGB itself
// so the light ordered dither works on what you actually see, then adds a vignette.
export function makeCompositeMaterial(env: Texture, chars: Texture) {
  return new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uEnv: { value: env },
      uChars: { value: chars },
      uEnvSize: { value: new Vector2(1, 1) },
      uCharSize: { value: new Vector2(1, 1) },
      uEnvScale: { value: 3 },
      uCharScale: { value: 2 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uEnv;
      uniform sampler2D uChars;
      uniform vec2 uEnvSize;
      uniform vec2 uCharSize;
      uniform float uEnvScale;
      uniform float uCharScale;
      varying vec2 vUv;

      float bayer4(vec2 p) {
        ivec2 i = ivec2(mod(p, 4.0));
        int idx = i.x + i.y * 4;
        int m[16] = int[16](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
        return float(m[idx]) / 16.0 - 0.5;
      }

      // Snap to a limited number of shades per channel. A light dither breaks up
      // banding in the sky without making moving things shimmer.
      vec3 quantize(vec3 c, vec2 px, float levels) {
        return floor(c * levels + 0.5 + bayer4(px) * 0.45) / levels;
      }

      vec3 toSRGB(vec3 c) { return pow(max(c, 0.0), vec3(1.0 / 2.2)); }

      void main() {
        vec2 envPx = floor(gl_FragCoord.xy / uEnvScale);
        vec3 env = toSRGB(texture2D(uEnv, (envPx + 0.5) / uEnvSize).rgb);
        env = quantize(env, envPx, 40.0);

        vec2 chPx = floor(gl_FragCoord.xy / uCharScale);
        vec4 ch = texture2D(uChars, (chPx + 0.5) / uCharSize);
        vec3 chc = quantize(toSRGB(ch.rgb), chPx, 48.0);
        vec3 col = mix(env, chc, step(0.5, ch.a));

        vec2 d = vUv - vec2(0.5, 0.47);
        col *= 1.0 - smoothstep(0.5, 1.0, length(d * vec2(1.1, 1.0))) * 0.45;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  })
}

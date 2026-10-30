// Visual-novel bust portraits, drawn as flat vector shapes on a 120×150 canvas and
// turned into pixel art by raster.ts. Each builder returns an SVG string for one
// expression, with eyes open or shut and mouth open or closed (for blinking and talking).
//
// Manish's portrait follows his photo: short spiky black hair swept up, silver
// rectangular glasses, a short full beard, a lavender shirt, earbuds in.

export type Who = 'Manish' | 'Chai wala' | 'Indie'
export type Mood = 'neutral' | 'smile' | 'smug' | 'surprised' | 'grin' | 'happy' | 'curious'

export const MOODS: Record<Who, Mood[]> = {
  Manish: ['neutral', 'smile', 'smug', 'surprised'],
  'Chai wala': ['neutral', 'grin', 'surprised'],
  Indie: ['neutral', 'happy', 'curious'],
}

export interface Frame {
  mood: Mood
  blink: boolean
  talk: boolean
}

const svg = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" width="120" height="150">${body}</svg>`
const P = (d: string, fill: string) => `<path d="${d}" fill="${fill}"/>`
const E = (cx: number, cy: number, rx: number, ry: number, fill: string) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"/>`
const R = (x: number, y: number, w: number, h: number, fill: string) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`

/** Mirror a left-side shape to the right side of the face (x → 120 − x). */
const mirror = (shape: string) => `<g transform="translate(120 0) scale(-1 1)">${shape}</g>`

// ---------------------------------------------------------------- Manish

const A = {
  skin: '#A8714E',
  skinSh: '#86563A',
  hair: '#17101A',
  hairHi: '#3A2C44',
  beard: '#22171E',
  shirt: '#B9A3E3',
  shirtSh: '#9A84CC',
  shirtDeep: '#7E68B4',
  button: '#EEE6FA',
  frame: '#CBD1DA',
  frameSh: '#8A92A0',
  bud: '#121016',
  white: '#F7EAD7',
  iris: '#2E1A12',
  irisLo: '#6A3E24',
  lidShade: '#CDBFB8',
  rim: '#7FD1C7',
  mouth: '#6E2E2A',
}

function aliEye(f: Frame) {
  const x = 48
  if (f.blink) return P(`M41 59 Q48 62.5 55 59 L55 61 Q48 64.5 41 61 Z`, A.hair)
  const wide = f.mood === 'surprised'
  const lid = f.mood === 'smug' ? P(`M40 52 L56 52 L56 58.5 L40 58.5 Z`, A.skin) : ''
  const smile = f.mood === 'smile' ? P(`M40 63.5 Q48 58.5 56 63.5 L56 67 L40 67 Z`, A.skin) : ''
  return [
    E(x, 59, 6.2, wide ? 6 : 5, A.white),
    P(`M42 ${wide ? 56 : 57} Q48 ${wide ? 52.5 : 54.5} 54 ${wide ? 56 : 57} L54 58 Q48 56 42 58 Z`, A.lidShade),
    E(x + 1, 59.5, wide ? 3 : 3.6, wide ? 3.6 : 4.4, A.iris),
    E(x + 1, 61.5, wide ? 2.2 : 2.6, wide ? 1.6 : 2, A.irisLo),
    R(x + 0.5, 56.5, 2, 2, A.white),
    lid,
    smile,
    P(`M41 ${wide ? 55 : 57} Q48 ${wide ? 50 : 52} 55 ${wide ? 54 : 56} L55.5 ${wide ? 56 : 58} Q48 ${wide ? 52 : 54} 41 ${wide ? 57 : 59} Z`, A.hair),
  ].join('')
}

function aliBrows(f: Frame) {
  const left = f.mood === 'surprised' ? -3 : 0
  const right = f.mood === 'smug' ? -4 : left
  const l = P(`M41 ${50 + left} L54 ${48.5 + left} L54 ${51 + left} L41 ${52.5 + left} Z`, A.hair)
  const r = P(`M41 ${50 + right} L54 ${48.5 + right} L54 ${51 + right} L41 ${52.5 + right} Z`, A.hair)
  return l + mirror(r)
}

function aliMouth(f: Frame) {
  if (f.talk) {
    const w = f.mood === 'smile' ? 8 : 6
    return P(`M${60 - w} 75 Q60 74 ${60 + w} 75 Q${59 + w} 81.5 60 82.5 Q${61 - w} 81.5 ${60 - w} 75 Z`, A.mouth) + R(60 - w + 2, 75, (w - 2) * 2, 1.4, A.white)
  }
  switch (f.mood) {
    case 'smile':
      return P(`M52 75 Q60 81 68 75 L68 76.6 Q60 83 52 76.6 Z`, A.mouth)
    case 'smug':
      return P(`M55 77.5 Q62 77.5 67.5 74 L67.5 75.8 Q62 79.5 55 79.2 Z`, A.mouth)
    case 'surprised':
      return E(60, 77.5, 2.6, 3, A.mouth)
    default:
      return R(55, 76.5, 10, 1.8, A.mouth)
  }
}

/** One rectangular lens frame, around the left eye; mirrored for the right. */
const lens = () =>
  [
    R(38, 51, 21, 1.8, A.frame),
    R(38, 65.2, 21, 1.8, A.frame),
    R(38, 51, 1.8, 16, A.frame),
    R(57.2, 51, 1.8, 16, A.frameSh),
    R(52, 53.4, 3.5, 1.2, A.white),
    R(34, 54, 4.2, 1.6, A.frameSh),
  ].join('')

export function ali(f: Frame) {
  return svg(
    [
      // lavender shirt, shaded on the left, open collar, buttons, a pocket
      P('M8 150 L12 122 Q18 104 42 98 L78 98 Q102 104 108 122 L112 150 Z', A.shirt),
      P('M8 150 L12 122 Q18 104 42 98 L46 112 Q30 120 26 150 Z', A.shirtSh),
      P('M30 150 Q34 132 40 124 L42 126 Q37 134 34 150 Z', A.shirtSh),
      P('M86 150 Q84 136 90 126 L92 128 Q88 136 90 150 Z', A.shirtSh),
      P('M72 124 L90 124 L90 140 L72 140 Z', A.shirtSh),
      P('M72 124 L90 124 L90 126.5 L72 126.5 Z', A.shirtDeep),
      R(59, 110, 2, 40, A.shirtSh),
      E(60, 122, 1.6, 1.6, A.button),
      E(60, 137, 1.6, 1.6, A.button),
      P('M104 116 Q108 126 110 150 L112 150 L108 122 Q102 106 86 100 L86 102 Q100 106 104 116 Z', A.rim),
      // neck in the open collar, then the two collar points
      P('M51 78 L69 78 L70 100 L60 112 L50 100 Z', A.skin),
      P('M51 84 Q60 92 69 84 L69 92 Q60 98 51 92 Z', A.skinSh),
      P('M40 99 L50 94 L60 112 L49 117 Z', A.shirt),
      P('M40 99 L50 94 L51 97 L43 101 Z', A.shirtDeep),
      mirror(P('M40 99 L50 94 L60 112 L49 117 Z', A.shirtSh)),
      // short back-and-sides hair behind the head
      P('M32 58 Q28 30 52 19 Q80 13 90 32 Q95 46 88 60 L84 46 L36 46 Z', A.hair),
      // ears, with earbuds in
      E(35, 61, 4, 6, A.skin),
      E(85, 61, 4, 6, A.skin),
      E(35.5, 62.5, 2.4, 2.8, A.bud),
      E(84.5, 62.5, 2.4, 2.8, A.bud),
      // face
      P('M36 46 Q36 26 60 25 Q84 26 84 46 L84 60 Q83 76 68 85 Q60 90 52 85 Q37 76 36 60 Z', A.skin),
      P('M36 60 Q37 76 52 85 Q44 76 41 62 Z', A.skinSh),
      // short full beard along the jaw and chin, the lips clear, a moustache
      P('M36.5 58 Q37 77 52 86.5 Q60 91.5 68 86.5 Q83 77 83.5 58 L81 60 Q80 70 74 73.5 Q67 72 60 73 Q53 72 46 73.5 Q40 70 39 60 Z', A.beard),
      E(60, 78.5, 8.5, 4.6, A.skin),
      P('M48.5 73.5 Q60 68.5 71.5 73.5 L70.5 76.2 Q60 72.6 49.5 76.2 Z', A.beard),
      // hair swept up into spikes off the forehead, short at the temples
      P('M35 46 Q33 24 50 17 Q62 12 74 16 Q88 22 86 46 L80 41 Q60 35 40 41 Z', A.hair),
      P('M36 34 L29 18 L42 24 L38 6 L49 17 L50 1 L57 14 L63 -1 L66 13 L74 2 L74 16 L85 6 L82 20 L93 16 L86 30 Q88 38 86 44 L60 30 Z', A.hair),
      P('M44 20 L40 9 L48 17 Z', A.hairHi),
      P('M53 14 L56 4 L58 15 Z', A.hairHi),
      P('M67 14 L73 5 L72 17 Z', A.hairHi),
      P('M78 21 L86 11 L83 23 Z', A.hairHi),
      P('M42 38 Q55 32 70 34 L69 36.5 Q55 34.5 43 40.5 Z', A.hairHi),
      P('M35 45 L39.5 43 L38.5 56 L35.5 52 Z', A.hair),
      P('M85 45 L80.5 43 L81.5 56 L84.5 52 Z', A.hair),
      P('M88 44 Q90 30 80 20 L82 20 Q93 30 90 46 Z', A.rim),
      aliBrows(f),
      aliEye(f),
      mirror(aliEye(f)),
      // silver rectangular glasses, and the bridge between the lenses
      lens(),
      mirror(lens()),
      R(58.5, 54, 3, 1.6, A.frame),
      P('M60 64 L62.5 70.5 L58.5 70.5 Z', A.skinSh),
      aliMouth(f),
    ].join(''),
  )
}

// ---------------------------------------------------------------- the chai wala

const V = {
  skin: '#8A5A3C',
  skinSh: '#6E4630',
  cap: '#F7EAD7',
  capSh: '#D8CBAC',
  kurta: '#E7E0D0',
  kurtaSh: '#C9BFAE',
  must: '#2A2028',
  grey: '#5A5060',
  gam: '#C0504A',
  gamStripe: '#F7EAD7',
  white: '#F7EAD7',
  iris: '#2A1A14',
  irisLo: '#5A3A24',
  mouth: '#5A2424',
}

function vendorEye(f: Frame) {
  if (f.blink || f.mood === 'grin') return P('M41 61 Q47 56.5 53 61 L53 62.6 Q47 58.5 41 62.6 Z', V.must)
  const wide = f.mood === 'surprised'
  return [
    E(47, 61, 5.2, wide ? 4.8 : 3.6, V.white),
    E(47.5, 61.3, 2.6, wide ? 3.4 : 3, V.iris),
    E(47.5, 62.6, 1.8, 1.4, V.irisLo),
    R(47, 59.5, 1.5, 1.5, V.white),
    P(`M41 ${wide ? 58 : 59.5} Q47 ${wide ? 54.5 : 56.5} 53 ${wide ? 57.5 : 59} L53 ${wide ? 59 : 60.5} Q47 ${wide ? 56 : 58} 41 ${wide ? 59.5 : 61} Z`, V.must),
    // crow's feet
    R(38, 61, 2, 1, V.skinSh),
    R(38.5, 63, 2, 1, V.skinSh),
  ].join('')
}

function vendorMouth(f: Frame) {
  const grin = f.mood === 'grin'
  const must = grin
    ? 'M44 72 Q52 69 60 72.5 Q68 69 76 72 Q76 77.5 67 76 Q60 74.5 53 76 Q44 77.5 44 72 Z'
    : 'M45 74.5 Q53 69.5 60 72.5 Q67 69.5 75 74.5 Q73 78.5 66 77.2 Q60 75.8 54 77.2 Q47 78.5 45 74.5 Z'
  let mouth: string
  if (f.talk) mouth = P('M54 78 Q60 77 66 78 Q65 84 60 84.5 Q55 84 54 78 Z', V.mouth) + R(56, 78, 8, 1.3, V.white)
  else if (grin) mouth = P('M51 77.5 Q60 85 69 77.5 L68 80 Q60 86 52 80 Z', V.mouth) + R(54, 78, 12, 1.4, V.white)
  else if (f.mood === 'surprised') mouth = E(60, 80.5, 2.6, 2.8, V.mouth)
  else mouth = R(55, 79.5, 10, 1.6, V.mouth)
  return mouth + P(must, V.must)
}

export function vendor(f: Frame) {
  return svg(
    [
      // kurta with a V collar, a red gamchha over his left shoulder
      P('M6 150 L10 120 Q16 103 40 99 L80 99 Q104 103 110 120 L114 150 Z', V.kurta),
      P('M114 150 L110 120 Q104 103 80 99 L76 112 Q92 120 96 150 Z', V.kurtaSh),
      P('M52 99 L60 117 L68 99 Z', V.skinSh),
      E(60, 124, 1.4, 1.4, V.kurtaSh),
      E(60, 132, 1.4, 1.4, V.kurtaSh),
      P('M14 113 Q28 98 46 100 L40 150 L20 150 Z', V.gam),
      R(27, 104, 3, 46, V.gamStripe),
      R(35, 102, 2, 48, V.gamStripe),
      // neck, ears, a broad face
      P('M50 78 L70 78 L71 99 Q60 104 49 99 Z', V.skin),
      P('M50 82 Q60 92 70 82 L70 88 Q60 95 50 88 Z', V.skinSh),
      E(33, 62, 4.5, 6.5, V.skin),
      E(87, 62, 4.5, 6.5, V.skin),
      P('M34 50 Q34 30 60 29 Q86 30 86 50 L86 62 Q84 80 66 88 Q60 90.5 54 88 Q36 80 34 62 Z', V.skin),
      P('M86 62 Q84 80 66 88 Q78 78 81 62 Z', V.skinSh),
      // grey at the temples, under a white Gandhi topi
      P('M33 42 L38 42 L38 56 L34 53 Z', V.grey),
      P('M87 42 L82 42 L82 56 L86 53 Z', V.grey),
      P('M31 42 Q33 21 60 19 Q87 21 89 42 L85 44 Q60 35 35 44 Z', V.cap),
      P('M39 30 Q60 23 81 30 L81 31.8 Q60 25.5 39 31.8 Z', V.capSh),
      P('M35 44 Q60 35 85 44 L85 46 Q60 37.5 35 46 Z', V.capSh),
      // brows, eyes, a big nose, the moustache
      P(`M40 ${f.mood === 'surprised' ? 51 : 54} L54 ${f.mood === 'surprised' ? 50 : 53} L54 ${f.mood === 'surprised' ? 53 : 56} L40 ${f.mood === 'surprised' ? 54 : 57} Z`, V.grey),
      mirror(P(`M40 ${f.mood === 'surprised' ? 51 : 54} L54 ${f.mood === 'surprised' ? 50 : 53} L54 ${f.mood === 'surprised' ? 53 : 56} L40 ${f.mood === 'surprised' ? 54 : 57} Z`, V.grey)),
      vendorEye(f),
      mirror(vendorEye(f)),
      P('M58 60 Q64 66 63 71 L56 71 Q55 66 58 60 Z', V.skinSh),
      vendorMouth(f),
      // stubble
      ...[44, 49, 71, 76].map((x, i) => R(x, 82 + (i % 2) * 2, 1, 1, V.grey)),
    ].join(''),
  )
}

// ---------------------------------------------------------------- the indie

const D = {
  fur: '#1E1824',
  furHi: '#342A40',
  muzzle: '#2C2436',
  inner: '#4A2E3E',
  eye: '#B8743A',
  pupil: '#120C14',
  nose: '#08060C',
  noseHi: '#6A6080',
  tongue: '#D06070',
}

function dogEye(f: Frame) {
  if (f.blink || f.mood === 'happy') return P('M40 65 Q46 59 52 65 L52 67.4 Q46 62 40 67.4 Z', D.furHi)
  const round = f.mood === 'curious'
  return [E(46, 64, 5.5, 5.5, D.eye), E(46.5, 64.4, round ? 3.8 : 3, round ? 4 : 3.2, D.pupil), R(43.4, 61.4, 2, 2, '#FFF3D0')].join('')
}

export function dog(f: Frame) {
  const open = f.talk || f.mood === 'happy'
  return svg(
    [
      P('M18 150 Q22 112 60 106 Q98 112 102 150 Z', D.fur),
      P('M48 150 Q50 122 60 117 Q70 122 72 150 Z', D.furHi),
      // tall pointed indie ears
      P('M31 62 L28 13 L55 46 Z', D.fur),
      P('M89 62 L92 13 L65 46 Z', D.fur),
      P('M35 52 L33 26 L49 46 Z', D.inner),
      P('M85 52 L87 26 L71 46 Z', D.inner),
      P('M28 70 Q28 42 60 40 Q92 42 92 70 Q92 88 80 94 L40 94 Q28 88 28 70 Z', D.fur),
      P('M42 47 Q60 41 78 47 L76 50 Q60 45 44 50 Z', D.furHi),
      dogEye(f),
      mirror(dogEye(f)),
      // the long snout, nose, mouth
      P('M45 78 Q45 70 60 69 Q75 70 75 78 L75 92 Q71 104 60 105 Q49 104 45 92 Z', D.muzzle),
      P('M53 80 Q60 76 67 80 Q66 86 60 87.5 Q54 86 53 80 Z', D.nose),
      R(56, 79, 3, 1.5, D.noseHi),
      R(59.3, 87, 1.4, 6, D.nose),
      open ? E(60, 99, 4.6, 5.4, D.tongue) : '',
      P('M50 94 Q55 98 60 93.6 Q65 98 70 94 L70 95.8 Q65 100.5 60 96 Q55 100.5 50 95.8 Z', D.nose),
    ].join(''),
  )
}

export const ART: Record<Who, (f: Frame) => string> = { Manish: ali, 'Chai wala': vendor, Indie: dog }

import { SR, type Buf } from './dsp'

/** 16-bit mono WAV in a blob URL, which Howler can load like any file. */
export function wavUrl(samples: Buf): string {
  const n = samples.length
  const view = new DataView(new ArrayBuffer(44 + n * 2))
  const str = (o: number, s: string) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)))
  str(0, 'RIFF')
  view.setUint32(4, 36 + n * 2, true)
  str(8, 'WAVE')
  str(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, SR, true)
  view.setUint32(28, SR * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  str(36, 'data')
  view.setUint32(40, n * 2, true)
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true)
  }
  return URL.createObjectURL(new Blob([view], { type: 'audio/wav' }))
}

// Scene 4's Aegis Sandbox demo. Three made-up samples with findings in the style of
// Aegis's static engine (the heuristics are the ones its README lists), and a quick
// check you can run on a file of your own, entirely in the browser.

export type Sev = 'high' | 'med' | 'low'
export interface Finding {
  sev: Sev
  seen: string
  means: string
}
export interface Report {
  name: string
  type: string
  size?: string
  sha256?: string
  entropy: number
  verdict: string
  score: number
  findings: Finding[]
}

export const SAMPLES: Report[] = [
  {
    name: 'invoice_oct.pdf.exe',
    type: 'Windows program (PE32)',
    entropy: 7.8,
    verdict: 'Malicious',
    score: 92,
    findings: [
      { sev: 'high', seen: 'Name ends in .pdf.exe', means: 'Pretends to be a PDF' },
      { sev: 'high', seen: 'Code section entropy 7.8 of 8', means: 'Packed: the real code is hidden' },
      { sev: 'high', seen: 'Imports WriteProcessMemory, CreateRemoteThread', means: 'Can inject code into other programs (T1055)' },
      { sev: 'med', seen: 'Only 6 imports in total', means: 'Tiny import table, typical of packers' },
    ],
  },
  {
    name: 'electricity_bill.apk',
    type: 'Android app (APK)',
    entropy: 6.1,
    verdict: 'Malicious',
    score: 88,
    findings: [
      { sev: 'high', seen: 'Asks for READ_SMS and RECEIVE_SMS', means: 'Can read your OTPs' },
      { sev: 'high', seen: 'Accessibility service + draws over other apps', means: 'Banking-trojan pattern: fake screens over your bank app' },
      { sev: 'med', seen: 'Loads code at runtime (DexClassLoader)', means: 'Can fetch more malware later' },
      { sev: 'med', seen: 'Signed with a debug certificate', means: 'Not from a real publisher' },
    ],
  },
  {
    name: 'salary_revision.docm',
    type: 'Word document with macros',
    entropy: 4.7,
    verdict: 'Malicious',
    score: 81,
    findings: [
      { sev: 'high', seen: 'Macro runs on open (AutoOpen)', means: 'Runs the moment you open it' },
      { sev: 'high', seen: 'Macro calls Shell with a URL', means: 'Downloads and runs the next stage' },
      { sev: 'med', seen: 'Big Base64 blob inside the macro', means: 'Hiding what comes next' },
    ],
  },
]

const MAX_BYTES = 64 * 1024 * 1024

function entropyOf(b: Uint8Array) {
  if (!b.length) return 0
  const n = new Array<number>(256).fill(0)
  for (let i = 0; i < b.length; i++) n[b[i]]++
  let h = 0
  for (const c of n) if (c) h -= (c / b.length) * Math.log2(c / b.length)
  return h
}

function typeOf(b: Uint8Array, name: string) {
  const at = (...sig: number[]) => sig.every((v, i) => b[i] === v)
  const ext = name.toLowerCase().split('.').pop() ?? ''
  if (at(0x4d, 0x5a)) return 'Windows program (PE)'
  if (at(0x7f, 0x45, 0x4c, 0x46)) return 'Linux program (ELF)'
  if (at(0x25, 0x50, 0x44, 0x46)) return 'PDF'
  if (at(0xd0, 0xcf, 0x11, 0xe0)) return 'Old Office file (OLE)'
  if (at(0x50, 0x4b, 0x03, 0x04))
    return ext === 'apk' ? 'Android app (APK)' : ['docx', 'xlsx', 'pptx', 'docm', 'xlsm'].includes(ext) ? 'Office file (zip)' : ext === 'jar' ? 'Java archive' : 'Zip archive'
  if (at(0xcf, 0xfa, 0xed, 0xfe) || at(0xca, 0xfe, 0xba, 0xbe)) return 'macOS program (Mach-O)'
  return 'Other'
}

const fmtSize = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : n > 1024 ? `${(n / 1024).toFixed(1)} KB` : `${n} B`)

/** A handful of Aegis-style checks on a file the visitor picks. Nothing leaves the browser. */
export async function quickCheck(file: File): Promise<Report> {
  const buf = new Uint8Array(await file.slice(0, MAX_BYTES).arrayBuffer())
  const hash = await crypto.subtle.digest('SHA-256', buf)
  const sha256 = [...new Uint8Array(hash)].map((x) => x.toString(16).padStart(2, '0')).join('')
  const type = typeOf(buf, file.name)
  const entropy = entropyOf(buf)
  const text = new TextDecoder('latin1').decode(buf.subarray(0, 4 * 1024 * 1024))
  const findings: Finding[] = []

  const parts = file.name.toLowerCase().split('.')
  if (parts.length > 2 && ['exe', 'scr', 'js', 'vbs', 'bat', 'cmd', 'lnk', 'hta'].includes(parts[parts.length - 1]))
    findings.push({ sev: 'high', seen: `Double extension (.${parts.slice(-2).join('.')})`, means: 'Pretends to be a harmless file' })
  if (type.startsWith('Windows') && !['exe', 'dll', 'sys', 'scr', 'com'].includes(parts[parts.length - 1]))
    findings.push({ sev: 'high', seen: 'A Windows program with a different extension', means: 'Hiding what it really is' })
  if (entropy > 7.2 && !/zip|apk|archive|Office file|PDF/i.test(type))
    findings.push({ sev: 'med', seen: `Entropy ${entropy.toFixed(2)} of 8`, means: 'Packed, encrypted or compressed' })
  if (type === 'PDF')
    for (const [k, m] of [
      ['/JavaScript', 'Runs JavaScript inside the PDF'],
      ['/OpenAction', 'Does something as soon as it opens'],
      ['/Launch', 'Can launch another program'],
      ['/EmbeddedFile', 'Carries another file inside'],
    ])
      if (text.includes(k)) findings.push({ sev: k === '/Launch' || k === '/JavaScript' ? 'high' : 'low', seen: `Has ${k}`, means: m })
  if (/AutoOpen|Document_Open|Workbook_Open/.test(text)) findings.push({ sev: 'high', seen: 'Macro that runs on open', means: 'Runs the moment you open it' })
  if (/powershell(\.exe)?\s+-(e|enc|encodedcommand)\b/i.test(text)) findings.push({ sev: 'high', seen: 'Encoded PowerShell command', means: 'Hides what it runs' })
  const urls = new Set(text.match(/https?:\/\/[a-z0-9.-]+\.[a-z]{2,}[^\s"'<>]{0,40}/gi) ?? [])
  if (urls.size) findings.push({ sev: 'low', seen: `${urls.size} web address${urls.size > 1 ? 'es' : ''} inside`, means: 'Worth checking where they point' })

  const score = Math.min(99, findings.reduce((s, f) => s + (f.sev === 'high' ? 35 : f.sev === 'med' ? 15 : 5), 0))
  return {
    name: file.name,
    type,
    size: fmtSize(file.size),
    sha256,
    entropy,
    verdict: score >= 60 ? 'Suspicious' : score >= 20 ? 'Worth a closer look' : 'Nothing alarming',
    score,
    findings,
  }
}

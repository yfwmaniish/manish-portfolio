// Scene 5's star chart and certifications, from Manish's résumé and READMEs (2026-10-30).
// The chart is drawn from SKILL_GROUPS, so adding a skill adds a star.

export const SKILL_GROUPS = [
  { name: 'Detection & DFIR', items: ['Wazuh', 'ELK Stack', 'Splunk', 'DFIR-IRIS', 'MITRE ATT&CK', 'Autopsy', 'Volatility', 'FTK Imager'] },
  { name: 'Threat intel', items: ['MISP', 'VirusTotal', 'Maltego', 'SpiderFoot', 'Shodan', 'theHarvester', 'YARA / Sigma'] },
  { name: 'Offense', items: ['Nmap', 'Burp Suite', 'Metasploit', 'Wireshark', 'SQLmap', 'Nikto', 'Gobuster', 'OWASP Top 10'] },
  { name: 'Code & platforms', items: ['Python', 'Bash', 'SQL', 'PowerShell', 'Linux', 'Docker', 'Git', 'FastAPI'] },
]

export const CERTIFICATIONS = ['RHCSA (EX200)', 'Red Hat RH124 and RH134', 'CompTIA Security+ (in progress)', 'CEH v13 (in progress)', 'Accenture UK Developer & Technology Job Simulation']

export const CONSTELLATION_LABEL = `Skill constellations: ${SKILL_GROUPS.map((g) => `${g.name}: ${g.items.join(', ')}`).join('. ')}.`

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;')

/** One constellation per group, side by side: stars zig-zag down, joined by a dashed line. */
function chart() {
  const lines: string[] = []
  const names: string[] = []
  const stars: string[] = []
  SKILL_GROUPS.forEach((g, i) => {
    const x0 = 10 + i * 234
    names.push(`<text x="${x0}" y="34">${esc(g.name)}</text>`)
    const pts = g.items.map((item, k) => {
      const x = x0 + (k % 2 ? 78 : 8) + ((k * 37 + i * 13) % 20)
      const y = 78 + k * (g.items.length > 6 ? 48 : 60)
      stars.push(
        `<rect x="${x - 6}" y="${y - 6}" width="12" height="12" fill="#FFE3A8" style="animation: twinkle ${3 + ((k + i) % 5) * 0.35}s infinite ${(k * 0.3 + i * 0.2) % 1.6}s"></rect>` +
          `<text x="${x + 14}" y="${y + 6}">${esc(item)}</text>`,
      )
      return `${x},${y}`
    })
    lines.push(`<polyline class="constellation-line" points="${pts.join(' ')}"></polyline>`)
  })
  return (
    `<g fill="none" stroke="#F7EAD7" stroke-width="1.5" stroke-dasharray="6 6" opacity=".55">${lines.join('')}</g>` +
    `<g font-family="Silkscreen, monospace" font-size="13" fill="#FF8A4C" letter-spacing="2">${names.join('')}</g>` +
    `<g font-family="'Pixelify Sans', monospace" font-size="18" fill="#F7EAD7">${stars.join('')}</g>`
  )
}

export const CONSTELLATION_SVG = chart()

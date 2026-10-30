// Manish's projects, from his GitHub READMEs and résumé (2026-10-30), in plain English.
//
// The ids are the game's internal slot names, kept from the template so every scene,
// page and polaroid still lines up:
//   veherex → Aegis Sandbox (the café, 11:50 PM, with its own demo)
//   nicetry → Sentinel-05 (the log demo at 8:05 PM)
//   tejal → SDRMS (the bus stop, 9:40 PM)
//   sentiment → CrimeGPT
//   evening → this website

export interface Project {
  id: 'veherex' | 'nicetry' | 'tejal' | 'sentiment' | 'evening'
  title: string
  meta: string
  desc: string
  note: string
  tags: string[]
  /** An http link shows a button; anything else (a private repo) shows none. */
  href: string
  linkLabel: string
  bg: string
  sub: string
  /** His own line about it, in his words. None yet. */
  story?: string
}

export const PROJECTS: Project[] = [
  {
    id: 'veherex',
    title: 'Aegis Sandbox',
    meta: '2026 · Malware analysis · ships as MalwareTotal',
    desc: 'A malware analysis lab. Upload a suspicious file and it takes the file apart without running it: hashes, entropy, strings, imports, permissions, macros. Ask, and it also runs the file in a throwaway sandbox with no internet, and watches what it does.',
    note: 'Reads Windows, Linux, Android, macOS, Office, PDF and script files. Every finding keeps what it saw apart from what it thinks that means. It maps behaviour to MITRE ATT&CK, writes YARA and Sigma rules, compares its verdict with VirusTotal, and exports a report. 111 tests.',
    tags: ['Python', 'FastAPI', 'Celery', 'Postgres', 'Docker', 'Frida', 'YARA / Sigma', 'Claude API'],
    href: 'https://github.com/yfwmaniish/aegis-sandbox',
    linkLabel: 'View on GitHub',
    bg: '#7FD1C7',
    sub: 'takes malware apart, safely',
  },
  {
    id: 'nicetry',
    title: 'Sentinel-05',
    meta: '2026 · Incident analysis',
    desc: 'Give it a raw log file or a PDF report, and it gives back an incident report. It pulls out the IPs, hashes and domains, builds a timeline, checks them against threat intel, and maps what happened to MITRE ATT&CK.',
    note: 'Five stages, streamed live to the screen. Finding indicators and building the timeline is plain regex, not AI, so it is fast and testable. The LLM only does the reasoning, and must quote the log for every claim. It also writes Sigma and YARA rules and a script to block bad IPs, and remembers past incidents to spot repeat attackers.',
    tags: ['Python', 'FastAPI', 'Gemini', 'ChromaDB', 'VirusTotal', 'AbuseIPDB', 'Next.js'],
    href: 'https://github.com/yfwmaniish/Sentinel-05',
    linkLabel: 'View on GitHub',
    bg: '#FF8A4C',
    sub: 'NotebookLM for security logs',
  },
  {
    id: 'tejal',
    title: 'SDRMS',
    meta: 'Jul 2025 – Feb 2026 · Special Task Force, Haryana Police',
    desc: 'A search system for law enforcement. It brings 4 TB of records, logs and evidence into one place, so an investigator searches all of it at once instead of one system at a time.',
    note: 'MongoDB holds the records, OpenSearch makes them searchable with fuzzy matching, and a sync service keeps the two in step. It flags fake identities and odd patterns. Role-based access, TLS everywhere, and it runs on internal servers only, with no cloud.',
    tags: ['MongoDB', 'OpenSearch', 'Node.js', 'Express', 'React', 'Docker'],
    href: 'private',
    linkLabel: 'Private repo',
    bg: '#E7C55A',
    sub: 'built for the police, used by them',
  },
  {
    id: 'sentiment',
    title: 'CrimeGPT',
    meta: '2026 · Case management for police',
    desc: 'Case software for police investigators. You enter a case once, and it fills in all seven legal documents from it: seizure receipt, remand request, chargesheet and the rest.',
    note: 'The AI suggests which BNS sections apply and which past judgments are relevant, but nothing goes into a document until an officer confirms it. Legal text is copied word for word from India Code, never written by the AI. Works in English, Hindi and Gujarati.',
    tags: ['Django', 'PostgreSQL', 'pgvector', 'React', 'Sentence embeddings'],
    href: 'https://github.com/yfwmaniish/CrimeGPT',
    linkLabel: 'View on GitHub',
    bg: '#C9B8D6',
    sub: 'AI suggests, the officer decides',
  },
  {
    id: 'evening',
    title: 'One Evening in Mumbai',
    meta: '2026 · this website',
    desc: 'This portfolio: one night on Marine Drive as a 3D pixel-art visual novel, with things to find and people to talk to.',
    note: 'Every character, sound and piece of music is made in code. Built on goatfolio by my friend Ali Bhatkar: Ink for the story, React Three Fiber for the world.',
    tags: ['React', 'TypeScript', 'Three.js', 'React Three Fiber', 'Ink', 'Vercel'],
    href: 'https://manish.veltro.co.in',
    linkLabel: "You're already here",
    bg: '#F28C5A',
    sub: "the one you're standing in",
  },
]

/** Smaller things he's built, for the "side quests" page and the plain version.
 *  From his résumé and GitHub profile README (2026-10-30). Links only for public repos. */
export const SIDE_PROJECTS: { title: string; line: string; href?: string }[] = [
  { title: 'Wazuh SOC Lab', line: 'A home SOC: Wazuh watching Windows and Ubuntu, alerts into DFIR-IRIS, attacks from Atomic Red Team, triaged against ATT&CK.' },
  { title: 'Trinetra / Hydra', line: 'Dark-web threat intel. Scrapes forums, Pastebin and Reddit for leaks and attack chatter, and found 20+ leaks of Aadhaar and PAN records.', href: 'https://github.com/yfwmaniish/Trinetra-3.0-Backend' },
  { title: 'Akitty', line: 'ESP32 Rubber Ducky studio with Team HYDRA: turns DuckyScript into Arduino code, for authorised pentests.', href: 'https://github.com/yfwmaniish/Akitty' },
  { title: 'S3X Security Suite', line: 'One scanner for open S3 buckets, open FTP, exposed dev endpoints, weak JWTs, subdomains and ports.', href: 'https://github.com/yfwmaniish/S3X-Security-Suite-X' },
  { title: 'Kuber', line: 'Anti-money-laundering analysis: upload bank ledgers, trace multi-hop transfers on a network graph, and isolate laundering loops.' },
  { title: 'Signature verification', line: 'A computer-vision model that checks handwritten signatures on financial and legal documents and flags forgeries.' },
  { title: 'EEG mental-state model', line: 'A multi-output random forest that reads raw EEG and predicts attentive, calm, stressed or mind-wandering.' },
  { title: 'Aakriti', line: 'Crypto forensics: trace Bitcoin wallets on a live graph and replay where the money went.', href: 'https://github.com/yfwmaniish/Aakriti' },
  { title: 'agenttrace', line: 'Tamper-proof, signed audit trails for what AI agents do: hash chains, Ed25519, Merkle trees.', href: 'https://github.com/yfwmaniish/agenttrace' },
  { title: 'Codebase Time Machine', line: 'Ask a repo "why is this here?" and get answers that cite the commits.', href: 'https://github.com/yfwmaniish/codebase-time-machine' },
  { title: 'mulewatch', line: 'Spots mule bank accounts used in fraud. Built for a PSB IIT Hyderabad submission.', href: 'https://github.com/yfwmaniish/mulewatch' },
  { title: 'NaughtyFoxy', line: 'OSINT case files with AI entity extraction, a who-knows-who mind map, and PDF reports.', href: 'https://github.com/yfwmaniish/naughty-fox-osint' },
  { title: 'Automated VAPT tool', line: 'Chains recon and vulnerability scans across web and network targets.', href: 'https://github.com/yfwmaniish/vapt-analysis-platform' },
]

/** His open source work, checked against the upstream repos' main branches (2026-10-30):
 *  about 54 pull requests opened since August 2026, 21 merged so far. */
const prs = (repo: string) => `https://github.com/${repo}/pulls?q=is%3Apr+author%3Ayfwmaniish`
export const OPEN_SOURCE: { repo: string; line: string; href: string }[] = [
  { repo: 'Strapi', line: '12 merged: a database fix in strapi/strapi, and 11 docs PRs covering config options, REST parameters and an S3 migration note.', href: prs('strapi/documentation') },
  { repo: 'PostHog', line: '5 merged: a session-replay memory leak, a storage fallback, a bot-detection false positive, and corrected SDK config docs.', href: prs('PostHog/posthog-js') },
  { repo: 'htmx', line: 'Merged: out-of-band swaps now find their target even when the context element is detached.', href: prs('bigskysoftware/htmx') },
  { repo: 'joi', line: 'Merged: ISO date parsing pads a bare-hour timezone offset correctly.', href: prs('hapijs/joi') },
  { repo: 'zsh-syntax-highlighting', line: '2 merged: Arch Linux install docs and test README links.', href: prs('zsh-users/zsh-syntax-highlighting') },
  {
    repo: 'In review',
    line: 'Security fixes for knex (SQL injection, CWE-89), node-jsonwebtoken (ReDoS) and supabase-js (filter escaping), plus fixes to undici, date-fns, dayjs, excalidraw, Radix UI, validator.js and more.',
    href: 'https://github.com/search?q=author%3Ayfwmaniish+is%3Apr&type=pullrequests',
  },
]

/** Where he's worked, from his résumé and LinkedIn (2026-10-30). */
export const EXPERIENCE: { org: string; role: string; when: string; line: string }[] = [
  { org: 'Research Centre Imarat (RCI), DRDO', role: 'Cybersecurity Research Intern · Hyderabad', when: 'Aug 2026 – now', line: 'A confidential cybersecurity research project at a defence R&D lab. The details stay there.' },
  { org: 'Digital Peacock', role: 'Cyber Security Analyst · Dwarka, Delhi', when: 'Jun – Jul 2026', line: 'Security analyst role.' },
  { org: 'Uttar Pradesh Police', role: 'Cyber Security Intern · Amroha', when: 'Jun 2026', line: 'Cyber security internship with the UP Police.' },
  { org: 'Independent vulnerability research', role: 'Security Researcher', when: '2025 – now', line: 'Found and responsibly disclosed critical vulnerabilities affecting Airtel, Jio and Vi, and coordinated the fixes with the companies and CERT-In.' },
  { org: 'Special Task Force, Haryana Police', role: 'Cybersecurity Research Associate', when: 'Jul 2025 – Feb 2026', line: 'Built and ran SDRMS, bringing 4 TB of records and logs into one searchable system, helped correlate cases across investigations, and rolled out an eOffice system for 25 users.' },
  { org: 'GD Goenka University', role: 'Cybersecurity & Neural Systems Researcher', when: '2024 – now', line: 'Research on hybrid brain-computer interfaces and emotion recognition from EEG, MEG and fMEG signals (including the DEAP dataset), with an eye on neurosecurity.' },
  { org: 'IBM', role: 'Cybersecurity Intern · Remote', when: 'Jun – Aug 2024', line: 'Found and documented 12 endpoint vulnerabilities across 4 environments, wrote threat-detection playbooks, and built Trikaal, a role-based file-sharing app.' },
  { org: 'Infinity eServices', role: 'Summer Intern', when: 'Jul – Aug 2024', line: 'Integrated a CRM into the Universal Service Obligation (USO) system and wrote its website policies with the legal and compliance teams.' },
]

/** Wins and recognition, from his résumé and LinkedIn. */
export const ACHIEVEMENTS = [
  'Responsibly disclosed vulnerabilities affecting Airtel, Jio and Vi (via CERT-In)',
  'Top 5 globally, Hackapptoi CTF',
  'Finalist, Vishwa CTF (national)',
  '6× hackathon winner',
  '3× ROG Showdown Valorant champion',
  'IBM Certificate of Excellence, IBM × Phemesoft Ideathon (EcoPe)',
  '3rd place, Innovax Business Plan Competition (MSME, Govt. of India)',
  'Poster presentation, Quantum Quest 2025, IIT Kanpur',
]

export const LEADERSHIP = [
  'Founder, Veltro',
  'Founding Board Member, nCreeps (CTF team of 105+, since 2022)',
  'IBM Ambassador, Think 2025 Mumbai',
  'Head of PR, Avishkar Innovation Cell',
  'Secretary General, Lucid Vista',
  'Judge, Anveshna',
  'Esports player and manager, TheHonouredOnes',
]

// Two more things he can show on his laptop.
export const SCREENS = {
  scan: {
    title: 'AdverSim-IDS',
    meta: 'Research · basis of two papers',
    desc: "Can an attacker fool an AI intrusion detector? Earlier tests said yes, easily, but they cheated: they changed parts of the traffic a real attacker can't touch. AdverSim-IDS only lets an attack change what an attacker really controls, then measures what still gets through. Seven attacks, from gradient tricks to reinforcement-learning agents, on NSL-KDD and CICIDS2017.",
    href: 'https://github.com/yfwmaniish/adversim-ids',
    bg: '#7FD1C7',
  },
  about: {
    title: 'Manish Tiwari',
    meta: 'Gurugram · aka Decimal',
    desc: 'Final year of B.Tech CSE (cybersecurity) at GD Goenka University. Cybersecurity researcher.',
    note: "Founder of Veltro, IBM Ambassador, and a CTF player since 2022. I've worked with DRDO, the Haryana Police Special Task Force, the UP Police and IBM, and I've reported vulnerabilities in Airtel, Jio and Vi through CERT-In. I build tools that turn raw logs, malware and network traffic into answers a defender can act on, and I send fixes to open source projects like PostHog, Strapi and htmx.",
    facts: [
      ['Studying at', 'GD Goenka University · CGPA 9.4'],
      ['Right now', 'Research intern at RCI, DRDO'],
      ['Certified', 'RHCSA (EX200)'],
      ['Open source', '21 PRs merged · PostHog, Strapi, htmx'],
      ['CTF', 'Top 5 globally, Hackapptoi'],
      ['Looking for', 'Security research · analyst · pentester roles'],
    ],
    bg: '#FF8A4C',
  },
} as const

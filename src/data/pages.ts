// Manish's notebook pages. At 6:30 PM the wind blows them down the promenade; you find
// them along the walk. One page per scene lies in plain sight (so everyone sees all
// of his work); the rest are hidden between scenes.
// Project, about, skills and contact pages reuse the real data. Note pages are DRAFT
// copy, written for this build: Manish to approve or rewrite.
// Page ids are the template's slot names (where each one hides is wired to them).

export type PageKind = 'project' | 'scan' | 'about' | 'skills' | 'certs' | 'contact' | 'note'

export interface Page {
  id: string
  kind: PageKind
  title: string
  /** For project pages: which project. */
  project?: 'veherex' | 'nicetry' | 'tejal' | 'sentiment'
  /** For note pages: the lines written on it. */
  lines?: string[]
  /** A picture on the page (in /public), shown as pixel art. */
  image?: { src: string; alt: string }
  /** Where it ended up, shown as a hint on the missing page. */
  where: string
  /** Hidden pages need finding; the others lie in plain sight. */
  hidden: boolean
}

export const PAGES: Page[] = [
  { id: 'scan', kind: 'scan', title: 'The IDS research', where: 'on the promenade, 6:30 PM', hidden: false },
  { id: 'nicetry', kind: 'project', project: 'nicetry', title: 'Sentinel-05', where: "near the corn seller's coals", hidden: true },
  {
    id: 'train',
    kind: 'note',
    title: 'Side quests',
    // filled in from SIDE_PROJECTS by PageContent
    where: "inside a kid's soap bubble",
    hidden: true,
  },
  { id: 'about', kind: 'about', title: 'Who Manish is', where: 'under the streetlight, 8:05 PM', hidden: false },
  { id: 'sentiment', kind: 'project', project: 'sentiment', title: 'CrimeGPT', where: 'a blinking streetlamp', hidden: true },
  {
    id: 'chai-bill',
    kind: 'note',
    title: 'Game night',
    lines: ['☑ headphones on', '☑ ping under 30', '☐ sleep', 'Valorant: 3× ROG Showdown champion.', 'One more match. Then the logs. Probably.'],
    where: 'the street photographer',
    hidden: true,
  },
  { id: 'tejal', kind: 'project', project: 'tejal', title: 'SDRMS', where: 'the bus stop, 9:40 PM', hidden: false },
  { id: 'certs', kind: 'certs', title: 'Certificates and wins', where: 'a paper boat in the rain', hidden: true },
  {
    id: 'cat',
    kind: 'note',
    title: 'My dog',
    // the pixel drawing comes from PageContent (DogDoodle)
    lines: ['My dog. A black indie, straight off the street.', 'Best security system I own.'],
    where: 'a puddle',
    hidden: true,
  },
  { id: 'veherex', kind: 'project', project: 'veherex', title: 'Aegis Sandbox', where: 'the café table, 11:50 PM', hidden: false },
  {
    id: 'todo',
    kind: 'note',
    title: 'To-do list',
    lines: ['☐ finish final year', '☐ clear Security+ and CEH', '☐ get both papers published', '☑ top 5 at a global CTF', '☑ win six hackathons'],
    where: "the fisherman's line",
    hidden: true,
  },
  { id: 'skills', kind: 'skills', title: 'Skills', where: 'the sea wall, 2:10 AM', hidden: false },
  {
    id: 'sealink',
    kind: 'note',
    title: "Where I've worked",
    // filled in from EXPERIENCE by PageContent
    where: 'the newspaper cycle',
    hidden: true,
  },
  {
    id: 'draft',
    kind: 'note',
    title: 'A note to my future team',
    lines: ['Dear future team,', 'Hi, I’m Manish. Most people call me Decimal.', 'I can’t wait to defend things with you.'],
    where: 'a secret, near the end',
    hidden: true,
  },
  { id: 'contact', kind: 'contact', title: 'How to reach Manish', where: 'the sea link, 5:48 AM', hidden: false },
]

export const pageById = (id: string) => PAGES.find((p) => p.id === id)

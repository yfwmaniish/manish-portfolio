import { CONTACT } from '../data/chat'
import { CERTIFICATIONS, SKILL_GROUPS } from '../data/constellations'
import type { Page } from '../data/pages'
import { PERSON } from '../data/person'
import { ACHIEVEMENTS, EXPERIENCE, OPEN_SOURCE, PROJECTS, SCREENS, SIDE_PROJECTS } from '../data/projects'

// What's written on a notebook page, drawn in ink on lined paper. Used by the page
// card you see when you pick one up, and by the phone's Notebook app.

const label = 'font-ui text-[10px] tracking-wider text-plum'
const link = 'self-start border-2 border-shadow bg-accent px-3 py-2.5 font-ui text-[11px] text-night no-underline shadow-[3px_3px_0_#0A0918]'

/** His dog, drawn pixel by pixel: a black indie sitting up, ears pointed, tail curled over. */
function DogDoodle() {
  const K = '#17121E'
  const H = '#3A3048'
  return (
    <svg viewBox="0 0 40 30" shapeRendering="crispEdges" className="block w-full max-w-[240px] border-2 border-dashed border-plum/40 bg-[#FBF3E4] p-1" role="img" aria-label="A pixel drawing of a black indie dog sitting up">
      {/* ears */}
      <rect x={11} y={2} width={2} height={4} fill={K} />
      <rect x={17} y={2} width={2} height={4} fill={K} />
      <rect x={12} y={3} width={1} height={2} fill="#6E3463" />
      {/* head and snout */}
      <rect x={10} y={5} width={10} height={7} fill={K} />
      <rect x={6} y={9} width={5} height={3} fill={K} />
      <rect x={5} y={9} width={2} height={2} fill="#0A0918" />
      <rect x={12} y={7} width={2} height={1} fill="#C98A4A" />
      <rect x={16} y={7} width={2} height={1} fill="#C98A4A" />
      <rect x={8} y={12} width={4} height={1} fill="#B04040" />
      {/* neck, chest, body */}
      <rect x={12} y={12} width={8} height={4} fill={K} />
      <rect x={11} y={16} width={16} height={8} fill={K} />
      <rect x={13} y={14} width={3} height={5} fill={H} />
      {/* front legs, haunch, paws */}
      <rect x={12} y={24} width={2} height={4} fill={K} />
      <rect x={15} y={24} width={2} height={4} fill={K} />
      <rect x={21} y={20} width={7} height={8} fill={K} />
      <rect x={11} y={28} width={7} height={1} fill={K} />
      <rect x={21} y={28} width={8} height={1} fill={K} />
      {/* the curled tail */}
      <rect x={27} y={13} width={2} height={5} fill={K} />
      <rect x={28} y={11} width={4} height={2} fill={K} />
      <rect x={31} y={12} width={2} height={3} fill={K} />
      {/* ground */}
      <rect x={0} y={29} width={40} height={1} fill="#8A7A6A" />
    </svg>
  )
}

export function PageContent({ page }: { page: Page }) {
  if (page.kind === 'project') {
    const p = PROJECTS.find((x) => x.id === page.project)!
    return (
      <>
        <span className={label}>{p.meta}</span>
        {p.story && <p className="m-0 border-l-4 border-accent pl-3 font-display text-[17px] text-plum">{PERSON.first}: “{p.story}”</p>}
        <p className="m-0 font-display text-[19px] leading-[1.35]">{p.desc}</p>
        <p className="m-0 text-[13px]">{p.note}</p>
        <p className="m-0 text-[12px] text-plum">Built with: {p.tags.join(', ')}</p>
        {p.href.startsWith('http') && (
          <a href={p.href} target="_blank" rel="noreferrer" className={link}>
            {p.linkLabel} ›
          </a>
        )}
        {p.href === 'private' && <span className="text-[12px] text-plum">Built for the police, so the code stays private.</span>}
      </>
    )
  }
  if (page.kind === 'scan') {
    const s = SCREENS.scan
    return (
      <>
        <span className={label}>{s.meta}</span>
        <p className="m-0 font-display text-[19px] leading-[1.35]">Can you trick an AI that guards a network?</p>
        <p className="m-0 text-[13px]">{s.desc}</p>
        <p className="m-0 text-[12px] text-plum">Try it with {PERSON.first} at 11:50 PM.</p>
        <a href={s.href} target="_blank" rel="noreferrer" className={link}>
          View on GitHub ›
        </a>
      </>
    )
  }
  if (page.kind === 'about') {
    const a = SCREENS.about
    return (
      <>
        <span className={label}>{a.meta}</span>
        <p className="m-0 font-display text-[19px] leading-[1.35]">{a.desc}</p>
        <p className="m-0 text-[13px]">{a.note}</p>
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[12px]">
          {a.facts.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-plum">{k}</dt>
              <dd className="m-0">{v}</dd>
            </div>
          ))}
        </dl>
      </>
    )
  }
  if (page.kind === 'skills')
    return (
      <>
        {SKILL_GROUPS.map((g) => (
          <div key={g.name} className="flex flex-col">
            <span className={label}>{g.name}</span>
            <span className="text-[14px]">{g.items.join(' · ')}</span>
          </div>
        ))}
      </>
    )
  if (page.kind === 'certs')
    return (
      <>
        <ul className="m-0 flex flex-col gap-1 pl-5 font-display text-[18px]">
          {CERTIFICATIONS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <span className={label}>Wins</span>
        <ul className="m-0 flex flex-col gap-1 pl-5 text-[14px]">
          {ACHIEVEMENTS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </>
    )
  if (page.kind === 'contact')
    return (
      <>
        <p className="m-0 font-display text-[19px]">{CONTACT.open}</p>
        {[
          ['Email', CONTACT.email],
          ['GitHub', CONTACT.github],
          ['LinkedIn', CONTACT.linkedin],
          ['Résumé', CONTACT.resume],
        ].map(([k, v]) => {
          const item = v as { href: string; label: string }
          return (
            <a key={k as string} href={item.href} target="_blank" rel="noreferrer" className="flex justify-between gap-3 border-b-2 border-dashed border-plum/40 py-1.5 text-[13px] text-ink no-underline">
              <span className="text-plum">{k as string}</span>
              <span>{item.label}</span>
            </a>
          )
        })}
      </>
    )
  return (
    <div className="flex flex-col gap-1 font-display text-[19px] leading-[1.4]">
      {page.id === 'cat' && <DogDoodle />}
      {page.id === 'train' &&
        SIDE_PROJECTS.map((x) => (
          <p key={x.title} className="m-0 text-[14px] leading-snug">
            <b className="font-display text-[17px]">{x.title}</b> · {x.line}{' '}
            {x.href && (
              <a href={x.href} target="_blank" rel="noreferrer" className="text-plum">
                GitHub ›
              </a>
            )}
          </p>
        ))}
      {page.id === 'train' && OPEN_SOURCE.length > 0 && <span className={label}>Open source</span>}
      {page.id === 'train' &&
        OPEN_SOURCE.map((x) => (
          <p key={x.href} className="m-0 text-[14px] leading-snug">
            <a href={x.href} target="_blank" rel="noreferrer" className="font-display text-[17px] text-plum">
              {x.repo}
            </a>{' '}
            · {x.line}
          </p>
        ))}
      {page.id === 'sealink' &&
        EXPERIENCE.map((x) => (
          <div key={x.org} className="flex flex-col">
            <span className={label}>{x.when}</span>
            <span className="font-display text-[18px] font-bold leading-tight">{x.org}</span>
            <span className="text-[13px]">{x.role}. {x.line}</span>
          </div>
        ))}
      {page.image && (
        <img src={page.image.src} alt={page.image.alt} width={96} height={96} className="block h-auto w-full max-w-[240px] border-[3px] border-shadow [image-rendering:pixelated]" />
      )}
      {page.lines?.map((l) => (
        <p key={l} className="m-0">
          {l}
        </p>
      ))}
    </div>
  )
}

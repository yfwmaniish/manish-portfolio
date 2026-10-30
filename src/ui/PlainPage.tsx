import { CONTACT } from '../data/chat'
import { CERTIFICATIONS, SKILL_GROUPS } from '../data/constellations'
import { ENTRIES } from '../data/notebook'
import { ACHIEVEMENTS, EXPERIENCE, LEADERSHIP, OPEN_SOURCE, PROJECTS, SCREENS, SIDE_PROJECTS } from '../data/projects'

/**
 * The whole portfolio as one plain, readable page: for devices that can't run the
 * 3D world, if the 3D world fails, for screen readers, and for anyone in a hurry
 * (?plain in the URL, or the link on the title card).
 */
export function PlainPage({ reason }: { reason?: string }) {
  const about = SCREENS.about
  return (
    <div className="fixed inset-0 overflow-y-auto bg-night text-cream">
      <main className="mx-auto flex max-w-[760px] flex-col gap-10 px-5 py-10">
        {reason && <p className="m-0 border-2 border-cream/30 bg-shadow px-3 py-2 text-[13px] text-[#E4D6E8]">{reason}</p>}
        <header className="flex flex-col gap-2">
          <h1 className="m-0 font-display text-[clamp(40px,8vw,64px)] leading-none">{CONTACT.name}</h1>
          <p className="m-0 font-ui text-[12px] tracking-wider text-lamp">{CONTACT.tagline}</p>
          <p className="m-0 text-[16px] leading-relaxed">{about.desc}</p>
          <p className="m-0 text-[15px] leading-relaxed text-[#E4D6E8]">{about.note}</p>
          <p className="m-0 font-display text-[19px] text-accent">{CONTACT.open}</p>
          <nav aria-label="Contact" className="flex flex-wrap gap-2.5 pt-2">
            {[
              ['Email', CONTACT.email],
              ['GitHub', CONTACT.github],
              ['LinkedIn', CONTACT.linkedin],
              ['Résumé (PDF)', CONTACT.resume],
            ].map(([k, v]) => {
              const link = v as { href: string; label: string }
              return (
                <a key={k as string} href={link.href} target="_blank" rel="noreferrer" className="min-h-11 border-[3px] border-shadow bg-cream px-3.5 py-2.5 font-ui text-[11px] text-ink no-underline shadow-[3px_3px_0_#0A0918]">
                  {k as string}
                </a>
              )
            })}
          </nav>
        </header>

        <section className="flex flex-col gap-4" aria-labelledby="experience">
          <h2 id="experience" className="m-0 font-display text-[28px] text-lamp">Experience</h2>
          {EXPERIENCE.map((x) => (
            <article key={x.org} className="flex flex-col gap-1">
              <h3 className="m-0 font-display text-[21px]">{x.org}</h3>
              <p className="m-0 font-ui text-[11px] text-lilac">
                {x.role} · {x.when}
              </p>
              <p className="m-0 text-[14px] leading-relaxed text-[#E4D6E8]">{x.line}</p>
            </article>
          ))}
        </section>

        <section className="flex flex-col gap-5" aria-labelledby="projects">
          <h2 id="projects" className="m-0 font-display text-[28px] text-lamp">Projects</h2>
          {PROJECTS.map((p) => (
            <article key={p.id} className="flex flex-col gap-2 border-l-4 pl-4" style={{ borderColor: p.bg }}>
              <h3 className="m-0 font-display text-[22px]">{p.title}</h3>
              <p className="m-0 font-ui text-[11px] text-lilac">{p.meta}</p>
              {p.story && <p className="m-0 text-[14px] text-lamp-hot">“{p.story}”</p>}
              <p className="m-0 text-[15px] leading-relaxed">{p.desc}</p>
              <p className="m-0 text-[14px] leading-relaxed text-[#E4D6E8]">{p.note}</p>
              <p className="m-0 text-[13px] text-lilac">Built with: {p.tags.join(', ')}</p>
              {p.href.startsWith('http') && (
                <a href={p.href} target="_blank" rel="noreferrer" className="self-start text-[14px] text-teal">
                  {p.linkLabel} ›
                </a>
              )}
              {p.href === 'private' && <span className="text-[12px] text-[#B9B0D0]">Built for the police, so the code stays private.</span>}
            </article>
          ))}
        </section>

        <section className="flex flex-col gap-3" aria-labelledby="research">
          <h2 id="research" className="m-0 font-display text-[28px] text-lamp">Research</h2>
          <div className="flex flex-col gap-1">
            <h3 className="m-0 font-display text-[20px]">{SCREENS.scan.title}</h3>
            <p className="m-0 text-[14px] leading-relaxed text-[#E4D6E8]">{SCREENS.scan.desc}</p>
            <a href={SCREENS.scan.href} target="_blank" rel="noreferrer" className="self-start text-[14px] text-teal">
              View on GitHub ›
            </a>
          </div>
          {ENTRIES.map((e) => (
            <div key={e.title} className="flex flex-col gap-1">
              <h3 className="m-0 font-display text-[20px]">{e.title}</h3>
              <p className="m-0 text-[14px] leading-relaxed text-[#E4D6E8]">{e.body}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-3" aria-labelledby="more">
          <h2 id="more" className="m-0 font-display text-[28px] text-lamp">More projects</h2>
          {SIDE_PROJECTS.map((x) => (
            <p key={x.title} className="m-0 text-[14px] leading-relaxed text-[#E4D6E8]">
              <span className="font-display text-[17px] text-cream">{x.title}</span> · {x.line}{' '}
              {x.href && (
                <a href={x.href} target="_blank" rel="noreferrer" className="text-teal">
                  GitHub ›
                </a>
              )}
            </p>
          ))}
          {OPEN_SOURCE.length > 0 && (
            <>
              <h3 className="m-0 mt-2 font-display text-[21px]">Open source</h3>
              {OPEN_SOURCE.map((x) => (
                <p key={x.href} className="m-0 text-[14px] leading-relaxed text-[#E4D6E8]">
                  <a href={x.href} target="_blank" rel="noreferrer" className="font-display text-[17px] text-teal">
                    {x.repo}
                  </a>{' '}
                  · {x.line}
                </p>
              ))}
            </>
          )}
          <p className="m-0 text-[14px] text-[#E4D6E8]">
            <span className="font-ui text-[11px] text-accent">Wins: </span>
            {ACHIEVEMENTS.join(' · ')}
          </p>
          <p className="m-0 text-[14px] text-[#E4D6E8]">
            <span className="font-ui text-[11px] text-accent">Also: </span>
            {LEADERSHIP.join(' · ')}
          </p>
        </section>

        <section className="flex flex-col gap-3" aria-labelledby="skills">
          <h2 id="skills" className="m-0 font-display text-[28px] text-lamp">Skills</h2>
          {SKILL_GROUPS.map((g) => (
            <p key={g.name} className="m-0 text-[15px]">
              <span className="font-ui text-[11px] text-accent">{g.name}: </span>
              {g.items.join(' · ')}
            </p>
          ))}
          <p className="m-0 text-[15px]">
            <span className="font-ui text-[11px] text-accent">Certificates: </span>
            {CERTIFICATIONS.join(' · ')}
          </p>
        </section>

        <footer className="border-t-2 border-cream/20 pt-4 text-[13px] text-lilac">
          This is the plain version.{' '}
          <a href="/" className="text-teal">
            Walk through the full night on Marine Drive instead ›
          </a>
        </footer>
      </main>
    </div>
  )
}

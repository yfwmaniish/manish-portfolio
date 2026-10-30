import { PROJECTS } from '../../data/projects'
import { AppBody, AppHeader } from '../shared'
import { usePhone } from '../usePhone'

export function Gallery() {
  const item = usePhone((s) => s.galleryItem)
  const open = usePhone((s) => s.openGalleryItem)
  const project = PROJECTS.find((p) => p.id === item)

  if (project) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-night">
        <AppHeader title={project.title} onBack={() => open(null)} backLabel="Back to gallery" />
        <AppBody className="flex flex-col gap-3 p-3.5">
          <span className="font-ui text-[10px] text-accent">{project.meta}</span>
          {project.story && <p className="m-0 border-l-4 border-accent pl-2.5 text-[13px] text-lamp-hot">“{project.story}”</p>}
          <p className="m-0 font-display text-[18px] leading-[1.4]">{project.desc}</p>
          <p className="m-0 text-[13px] text-[#E4D6E8]">{project.note}</p>
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((t) => (
              <span key={t} className="border-2 border-plum px-2 py-1 font-ui text-[9px]">
                {t}
              </span>
            ))}
          </div>
          {project.href.startsWith('http') && (
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="self-start border-2 border-shadow bg-accent px-3.5 py-3 font-ui text-[11px] text-night no-underline"
            >
              {project.linkLabel} ›
            </a>
          )}
          {project.href === 'private' && <span className="font-ui text-[10px] text-lilac">Built for the police, so the code stays private.</span>}
        </AppBody>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-night">
      <AppHeader title="Gallery" />
      <AppBody className="grid grid-cols-2 content-start gap-2.5 p-3">
        {PROJECTS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => open(p.id)}
            className="flex aspect-square cursor-pointer flex-col justify-end gap-0.5 border-[3px] border-shadow p-2.5 text-left font-[inherit] text-night shadow-[3px_3px_0_#0A0918]"
            style={{ background: p.bg }}
          >
            <span className="font-display text-[18px] font-bold leading-[1.1]">{p.title}</span>
            <span className="font-ui text-[9px]">{p.sub}</span>
          </button>
        ))}
      </AppBody>
    </div>
  )
}

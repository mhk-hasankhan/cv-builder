import { memo, Fragment } from 'react'
import { HtmlContent, renderSection } from './sections.jsx'

export default memo(function SidebarTemplate({ cv }) {
  const { data, color_theme: color = '#7c3aed', enabled_sections = [], section_order = [] } = cv
  const p = data?.personal || {}
  const orderedEnabled = section_order.filter(s => enabled_sections.includes(s))

  const SIDEBAR_KEYS = new Set(['skills', 'languages', 'certifications', 'interests'])
  const sidebarSections = orderedEnabled.filter(s => SIDEBAR_KEYS.has(s))
  const mainSections    = orderedEnabled.filter(s => !SIDEBAR_KEYS.has(s) && s !== 'personal')

  const lightenColor = (hex, amount = 0.9) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgb(${Math.round(r + (255 - r) * amount)}, ${Math.round(g + (255 - g) * amount)}, ${Math.round(b + (255 - b) * amount)})`
  }

  const SidebarHeading = ({ children }) => (
    <h3 className="text-[9px] font-bold tracking-widest uppercase mb-2" style={{ color }}>{children}</h3>
  )

  const MainSectionTitle = ({ children }) => (
    <h2 className="text-[10px] font-bold tracking-widest uppercase mb-2 pb-1"
      style={{ color, borderBottom: `1.5px solid ${color}` }}>
      {children}
    </h2>
  )

  // ── Sidebar renderers (skills, languages, certifications, interests) ──────────
  const sidebarRenderers = {
    skills: () => !data.skills?.length ? null : (
      <div>
        <SidebarHeading>Skills</SidebarHeading>
        {data.skills.map((cat, i) => (
          <div key={i} className="mb-2">
            <div className="text-[10px] font-semibold text-zinc-700 mb-1">{cat.category}</div>
            <div className="flex flex-wrap gap-1">
              {(cat.items || []).map((skill, j) => (
                <span key={j} className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                  style={{ backgroundColor: lightenColor(color, 0.7), color }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),

    languages: () => !data.languages?.length ? null : (
      <div>
        <SidebarHeading>Languages</SidebarHeading>
        {data.languages.map((lang, i) => (
          <div key={i} className="flex justify-between text-[10px] mb-1">
            <span className="font-medium">{lang.language}</span>
            <span className="text-zinc-500">{lang.proficiency}</span>
          </div>
        ))}
      </div>
    ),

    certifications: () => !data.certifications?.length ? null : (
      <div>
        <SidebarHeading>Certifications</SidebarHeading>
        {data.certifications.map((cert, i) => (
          <div key={i} className="text-[10px] mb-1">
            <div className="font-medium">{cert.name}</div>
            {cert.issuer && <div className="text-zinc-500">{cert.issuer}</div>}
          </div>
        ))}
      </div>
    ),

    interests: () => !data.interests?.length ? null : (
      <div>
        <SidebarHeading>Interests</SidebarHeading>
        <p className="text-[10px] text-zinc-600">{data.interests.map(i => i.name).filter(Boolean).join(', ')}</p>
      </div>
    ),
    // Sidebar intentionally does not render custom sections (__custom omitted)
  }

  // ── Main panel renderers (experience, education, projects + custom) ───────────
  const mainRenderers = {
    experience: () => !data.experience?.length ? null : (
      <section>
        <MainSectionTitle>Work Experience</MainSectionTitle>
        <div className="space-y-3">
          {data.experience.map((exp, i) => (
            <div key={i}>
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold text-[11px]">{exp.jobTitle}</div>
                  <div className="text-zinc-500 text-[10px] italic">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                </div>
                <div className="text-zinc-400 text-[10px] text-right shrink-0 ml-2">
                  {[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}
                </div>
              </div>
              {exp.description && (
                <div className="mt-1 text-[10px] text-zinc-700 [&_ul]:list-disc [&_ul]:pl-4">
                  <HtmlContent html={exp.description} className="" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    ),

    education: () => !data.education?.length ? null : (
      <section>
        <MainSectionTitle>Education</MainSectionTitle>
        {data.education.map((edu, i) => (
          <div key={i} className="flex justify-between mb-2">
            <div>
              <div className="font-semibold text-[11px]">{edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}</div>
              <div className="text-zinc-500 text-[10px]">{edu.institution}</div>
            </div>
            <div className="text-zinc-400 text-[10px] text-right">
              {[edu.startDate, edu.endDate || 'Present'].filter(Boolean).join(' – ')}
            </div>
          </div>
        ))}
      </section>
    ),

    projects: () => !data.projects?.length ? null : (
      <section>
        <MainSectionTitle>Projects</MainSectionTitle>
        {data.projects.map((proj, i) => (
          <div key={i} className="mb-2">
            <div className="font-semibold text-[11px]">
              {proj.name}
              {proj.technologies?.length > 0 && (
                <span className="font-normal text-zinc-500 text-[9px] ml-2">{proj.technologies.join(', ')}</span>
              )}
            </div>
            {proj.description && (
              <div className="text-zinc-700 text-[10px] [&_ul]:list-disc [&_ul]:pl-4">
                <HtmlContent html={proj.description} className="" />
              </div>
            )}
          </div>
        ))}
      </section>
    ),

    __custom: (custom) => (
      <section>
        <MainSectionTitle>{custom.title}</MainSectionTitle>
        {(custom.entries || []).map((entry, i) => (
          <div key={i} className="mb-1">
            {entry.title && <div className="font-semibold text-[11px]">{entry.title}</div>}
            {entry.content && (
              <div className="text-[10px] text-zinc-700 [&_ul]:list-disc [&_ul]:pl-4">
                <HtmlContent html={entry.content} className="" />
              </div>
            )}
          </div>
        ))}
      </section>
    ),
  }

  return (
    <div className="cv-preview bg-white text-zinc-800 flex min-h-full"
      style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px' }}>

      {/* Sidebar */}
      <div className="w-[35%] shrink-0 p-6 space-y-5" style={{ backgroundColor: lightenColor(color, 0.93) }}>
        {p.photo && (
          <img src={p.photo} alt="" className="w-20 h-20 rounded-full object-cover mx-auto border-2"
            style={{ borderColor: color }} />
        )}
        <div>
          <h1 className="text-lg font-bold leading-tight" style={{ color, fontFamily: "'Outfit', sans-serif" }}>
            {p.name || 'Your Name'}
          </h1>
        </div>

        <div className="space-y-1">
          <SidebarHeading>Contact</SidebarHeading>
          {p.email    && <div className="text-[10px] text-zinc-600 break-all">{p.email}</div>}
          {p.phone    && <div className="text-[10px] text-zinc-600">{p.phone}</div>}
          {p.address  && <div className="text-[10px] text-zinc-600">{p.address}</div>}
          {p.website  && <div className="text-[10px] text-zinc-600 break-all">{p.website}</div>}
          {p.linkedin && <div className="text-[10px] text-zinc-600 break-all">{p.linkedin}</div>}
          {p.github   && <div className="text-[10px] text-zinc-600 break-all">{p.github}</div>}
        </div>

        {sidebarSections.map(section => {
          const node = renderSection(section, data, sidebarRenderers)
          return node ? <Fragment key={section}>{node}</Fragment> : null
        })}
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 space-y-4">
        {mainSections.map(section => {
          const node = renderSection(section, data, mainRenderers)
          return node ? <Fragment key={section}>{node}</Fragment> : null
        })}
      </div>
    </div>
  )
})

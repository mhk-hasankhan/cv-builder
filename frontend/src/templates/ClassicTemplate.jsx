import { memo, Fragment } from 'react'
import { HtmlContent, renderSection } from './sections.jsx'

export default memo(function ClassicTemplate({ cv }) {
  const { data, color_theme: color = '#1a1a2e', enabled_sections = [], section_order = [] } = cv
  const p = data?.personal || {}
  const orderedEnabled = section_order.filter(s => enabled_sections.includes(s))

  const SectionTitle = ({ children }) => (
    <h2 className="text-[11px] font-bold tracking-widest uppercase mb-2 pb-1"
      style={{ color, borderBottom: `1px solid ${color}` }}>
      {children}
    </h2>
  )

  const renderers = {
    experience: () => !data.experience?.length ? null : (
      <section>
        <SectionTitle>Experience</SectionTitle>
        <div className="space-y-3">
          {data.experience.map((exp, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto] gap-x-4">
              <div>
                <div className="font-bold text-[11px]">{exp.jobTitle}</div>
                <div className="italic text-zinc-600 text-[10px]">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                {exp.description && (
                  <div className="mt-1 text-[10px] text-zinc-700 [&_ul]:list-disc [&_ul]:pl-4">
                    <HtmlContent html={exp.description} />
                  </div>
                )}
              </div>
              <div className="text-right text-zinc-500 text-[10px] whitespace-nowrap pt-0.5">
                {[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}
              </div>
            </div>
          ))}
        </div>
      </section>
    ),

    education: () => !data.education?.length ? null : (
      <section>
        <SectionTitle>Education</SectionTitle>
        <div className="space-y-2">
          {data.education.map((edu, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto] gap-x-4">
              <div>
                <div className="font-bold text-[11px]">{edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}</div>
                <div className="italic text-zinc-600 text-[10px]">{edu.institution}</div>
              </div>
              <div className="text-right text-zinc-500 text-[10px] whitespace-nowrap pt-0.5">
                {[edu.startDate, edu.endDate || 'Present'].filter(Boolean).join(' – ')}
              </div>
            </div>
          ))}
        </div>
      </section>
    ),

    skills: () => !data.skills?.length ? null : (
      <section>
        <SectionTitle>Skills</SectionTitle>
        {data.skills.map((cat, i) => (
          <div key={i} className="flex gap-2 text-[10px] mb-0.5">
            <span className="font-bold shrink-0">{cat.category}:</span>
            <span className="text-zinc-700">{(cat.items || []).join(' · ')}</span>
          </div>
        ))}
      </section>
    ),

    projects: () => !data.projects?.length ? null : (
      <section>
        <SectionTitle>Projects</SectionTitle>
        {data.projects.map((proj, i) => (
          <div key={i} className="mb-2">
            <span className="font-bold text-[11px]">{proj.name}</span>
            {proj.technologies?.length > 0 && (
              <span className="text-zinc-500 text-[9px] ml-2">{proj.technologies.join(', ')}</span>
            )}
            {proj.description && (
              <div className="text-zinc-700 text-[10px] mt-0.5 [&_ul]:list-disc [&_ul]:pl-4">
                <HtmlContent html={proj.description} />
              </div>
            )}
          </div>
        ))}
      </section>
    ),

    certifications: () => !data.certifications?.length ? null : (
      <section>
        <SectionTitle>Certifications</SectionTitle>
        {data.certifications.map((cert, i) => (
          <div key={i} className="flex justify-between text-[10px] mb-0.5">
            <span>
              <span className="font-bold">{cert.name}</span>
              {cert.issuer && `, ${cert.issuer}`}
            </span>
            {cert.date && <span className="text-zinc-500">{cert.date}</span>}
          </div>
        ))}
      </section>
    ),

    languages: () => !data.languages?.length ? null : (
      <section>
        <SectionTitle>Languages</SectionTitle>
        <p className="text-[10px]">{data.languages.map(l => `${l.language} (${l.proficiency})`).join(' • ')}</p>
      </section>
    ),

    __custom: (custom) => (
      <section>
        <SectionTitle>{custom.title}</SectionTitle>
        {(custom.entries || []).map((entry, i) => (
          <div key={i} className="mb-1">
            {entry.title && <div className="font-bold text-[11px]">{entry.title}</div>}
            {entry.content && (
              <div className="text-[10px] text-zinc-700 [&_ul]:list-disc [&_ul]:pl-4">
                <HtmlContent html={entry.content} />
              </div>
            )}
          </div>
        ))}
      </section>
    ),
  }

  return (
    <div className="cv-preview bg-white text-zinc-800"
      style={{ fontFamily: "'Source Serif 4', serif", fontSize: '11px', lineHeight: '1.6' }}>

      {/* Header */}
      <div className="px-10 pt-8 pb-5">
        <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color, fontFamily: "'Outfit', sans-serif" }}>
          {p.name || 'Your Name'}
        </h1>
        <div className="flex flex-wrap gap-x-4 text-zinc-500 text-[10px] mt-1">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.address && <span>{p.address}</span>}
          {p.website && <span>{p.website}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.github && <span>{p.github}</span>}
        </div>
      </div>

      <div className="px-10 pb-8 space-y-4">
        {orderedEnabled.filter(s => s !== 'personal').map(section => {
          const node = renderSection(section, data, renderers)
          return node ? <Fragment key={section}>{node}</Fragment> : null
        })}
      </div>
    </div>
  )
})

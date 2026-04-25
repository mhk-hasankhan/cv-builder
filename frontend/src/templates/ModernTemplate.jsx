import { memo } from 'react'

function stripHtml(html) {
  if (!html) return ''
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

function HtmlContent({ html }) {
  if (!html) return null
  return <div dangerouslySetInnerHTML={{ __html: html }} className="prose-cv" />
}

export default memo(function ModernTemplate({ cv }) {
  const { data, color_theme: color = '#2563eb', font_family = 'inter', enabled_sections = [], section_order = [] } = cv
  const p = data?.personal || {}

  const fontClass = font_family === 'lora' ? 'font-lora' : font_family === 'serif' ? 'font-serif' : ''

  const SectionTitle = ({ children }) => (
    <div className="flex items-center gap-3 mb-3">
      <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color }}>{children}</h2>
      <div className="flex-1 h-px" style={{ backgroundColor: color + '40' }} />
    </div>
  )

  const orderedEnabled = section_order.filter(s => enabled_sections.includes(s))

  return (
    <div className={`cv-preview bg-white text-zinc-800 ${fontClass}`}
      style={{ fontFamily: font_family === 'lora' ? "'Lora', serif" : font_family === 'serif' ? "'Source Serif 4', serif" : "'DM Sans', sans-serif", fontSize: '11px', lineHeight: '1.5' }}>

      {/* Header */}
      <div className="px-8 pt-8 pb-6 text-center" style={{ borderBottom: `2px solid ${color}` }}>
        {p.photo && (
          <img src={p.photo} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2"
            style={{ borderColor: color }} />
        )}
        <h1 className="text-2xl font-bold mb-1" style={{ color, fontFamily: "'Outfit', sans-serif" }}>
          {p.name || 'Your Name'}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-zinc-500 text-[10px]">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>•</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.address && <span>•</span>}
          {p.address && <span>{p.address}</span>}
          {p.website && <span>•</span>}
          {p.website && <span>{p.website}</span>}
        </div>
        {(p.linkedin || p.github) && (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-0.5 text-zinc-500 text-[10px]">
            {p.linkedin && <span>{p.linkedin}</span>}
            {p.github && <span>•</span>}
            {p.github && <span>{p.github}</span>}
            {(p.otherLinks || []).map((l, i) => <span key={i}>• {l.label || l.url}</span>)}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-8 py-5 space-y-5">
        {orderedEnabled.filter(s => s !== 'personal').map(section => {
          switch(section) {
            case 'experience': return data.experience?.length ? (
              <section key={section}>
                <SectionTitle>Work Experience</SectionTitle>
                <div className="space-y-3">
                  {data.experience.map((exp, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-[11px]">{exp.jobTitle}</div>
                          <div className="text-zinc-500 text-[10px] italic">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                        </div>
                        <div className="text-zinc-400 text-[10px] shrink-0 ml-2">
                          {[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}
                        </div>
                      </div>
                      {exp.description && (
                        <div className="mt-1 text-zinc-600 text-[10px] leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4">
                          <HtmlContent html={exp.description} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ) : null

            case 'education': return data.education?.length ? (
              <section key={section}>
                <SectionTitle>Education</SectionTitle>
                <div className="space-y-2">
                  {data.education.map((edu, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-[11px]">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</div>
                        <div className="text-zinc-500 text-[10px] italic">{edu.institution}</div>
                        {edu.description && <div className="text-zinc-600 text-[10px] mt-0.5"><HtmlContent html={edu.description} /></div>}
                      </div>
                      <div className="text-zinc-400 text-[10px] shrink-0 ml-2">
                        {[edu.startDate, edu.endDate || 'Present'].filter(Boolean).join(' – ')}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null

            case 'skills': return data.skills?.length ? (
              <section key={section}>
                <SectionTitle>Skills</SectionTitle>
                <div className="space-y-1">
                  {data.skills.map((cat, i) => (
                    <div key={i} className="flex gap-2 text-[10px]">
                      <span className="font-semibold text-zinc-700 shrink-0">{cat.category}:</span>
                      <span className="text-zinc-600">{(cat.items || []).join(', ')}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null

            case 'projects': return data.projects?.length ? (
              <section key={section}>
                <SectionTitle>Projects</SectionTitle>
                <div className="space-y-2">
                  {data.projects.map((proj, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[11px]">{proj.name}</span>
                        {proj.technologies?.length > 0 && (
                          <span className="text-zinc-400 text-[9px]">({proj.technologies.join(', ')})</span>
                        )}
                      </div>
                      {proj.description && <div className="text-zinc-600 text-[10px] mt-0.5 [&_ul]:list-disc [&_ul]:pl-4"><HtmlContent html={proj.description} /></div>}
                      {(proj.github || proj.liveUrl) && (
                        <div className="flex gap-3 mt-0.5">
                          {proj.github && <span className="text-[9px]" style={{ color }}>{proj.github}</span>}
                          {proj.liveUrl && <span className="text-[9px]" style={{ color }}>{proj.liveUrl}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ) : null

            case 'certifications': return data.certifications?.length ? (
              <section key={section}>
                <SectionTitle>Certifications & Achievements</SectionTitle>
                <div className="space-y-1">
                  {data.certifications.map((cert, i) => (
                    <div key={i} className="flex justify-between text-[10px]">
                      <div>
                        <span className="font-semibold">{cert.name}</span>
                        {cert.issuer && <span className="text-zinc-500"> — {cert.issuer}</span>}
                      </div>
                      {cert.date && <span className="text-zinc-400 shrink-0 ml-2">{cert.date}</span>}
                    </div>
                  ))}
                </div>
              </section>
            ) : null

            case 'languages': return data.languages?.length ? (
              <section key={section}>
                <SectionTitle>Languages</SectionTitle>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {data.languages.map((lang, i) => (
                    <span key={i} className="text-[10px]">
                      <span className="font-semibold">{lang.language}</span>
                      <span className="text-zinc-400"> ({lang.proficiency})</span>
                    </span>
                  ))}
                </div>
              </section>
            ) : null

            case 'interests': return data.interests?.length ? (
              <section key={section}>
                <SectionTitle>Interests</SectionTitle>
                <p className="text-[10px] text-zinc-600">{data.interests.map(i => i.name).filter(Boolean).join(', ')}</p>
              </section>
            ) : null

            default: {
              // Custom sections
              const custom = data.customSections?.find(s => s.id === section)
              if (!custom) return null
              return (
                <section key={section}>
                  <SectionTitle>{custom.title}</SectionTitle>
                  <div className="space-y-2">
                    {(custom.entries || []).map((entry, i) => (
                      <div key={i}>
                        {entry.title && <div className="font-semibold text-[11px]">{entry.title}</div>}
                        {entry.content && <div className="text-zinc-600 text-[10px] [&_ul]:list-disc [&_ul]:pl-4"><HtmlContent html={entry.content} /></div>}
                      </div>
                    ))}
                  </div>
                </section>
              )
            }
          }
        })}
      </div>
    </div>
  )
})

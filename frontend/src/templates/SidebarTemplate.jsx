import { memo } from 'react'
import DOMPurify from 'dompurify'

function HtmlContent({ html }) {
  if (!html) return null
  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
}

export default memo(function SidebarTemplate({ cv }) {
  const { data, color_theme: color = '#7c3aed', enabled_sections = [], section_order = [] } = cv
  const p = data?.personal || {}
  const orderedEnabled = section_order.filter(s => enabled_sections.includes(s))

  // Split into sidebar (left) and main (right) sections
  const sidebarSections = orderedEnabled.filter(s => ['skills', 'languages', 'certifications', 'interests'].includes(s))
  const mainSections = orderedEnabled.filter(s => !['skills', 'languages', 'certifications', 'interests', 'personal'].includes(s))

  const lightenColor = (hex, amount = 0.9) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgb(${Math.round(r + (255 - r) * amount)}, ${Math.round(g + (255 - g) * amount)}, ${Math.round(b + (255 - b) * amount)})`
  }

  return (
    <div className="cv-preview bg-white text-zinc-800 flex min-h-full" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px' }}>
      {/* Sidebar */}
      <div className="w-[35%] shrink-0 p-6 space-y-5" style={{ backgroundColor: lightenColor(color, 0.93) }}>
        {p.photo && (
          <img src={p.photo} alt="" className="w-20 h-20 rounded-full object-cover mx-auto border-2" style={{ borderColor: color }} />
        )}
        <div>
          <h1 className="text-lg font-bold leading-tight" style={{ color, fontFamily: "'Outfit', sans-serif" }}>
            {p.name || 'Your Name'}
          </h1>
        </div>

        {/* Contact */}
        <div className="space-y-1">
          <h3 className="text-[9px] font-bold tracking-widest uppercase mb-2" style={{ color }}>Contact</h3>
          {p.email && <div className="text-[10px] text-zinc-600 break-all">{p.email}</div>}
          {p.phone && <div className="text-[10px] text-zinc-600">{p.phone}</div>}
          {p.address && <div className="text-[10px] text-zinc-600">{p.address}</div>}
          {p.website && <div className="text-[10px] text-zinc-600 break-all">{p.website}</div>}
          {p.linkedin && <div className="text-[10px] text-zinc-600 break-all">{p.linkedin}</div>}
          {p.github && <div className="text-[10px] text-zinc-600 break-all">{p.github}</div>}
        </div>

        {sidebarSections.map(section => {
          switch(section) {
            case 'skills': return data.skills?.length ? (
              <div key={section}>
                <h3 className="text-[9px] font-bold tracking-widest uppercase mb-2" style={{ color }}>Skills</h3>
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
            ) : null

            case 'languages': return data.languages?.length ? (
              <div key={section}>
                <h3 className="text-[9px] font-bold tracking-widest uppercase mb-2" style={{ color }}>Languages</h3>
                {data.languages.map((lang, i) => (
                  <div key={i} className="flex justify-between text-[10px] mb-1">
                    <span className="font-medium">{lang.language}</span>
                    <span className="text-zinc-500">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            ) : null

            case 'certifications': return data.certifications?.length ? (
              <div key={section}>
                <h3 className="text-[9px] font-bold tracking-widest uppercase mb-2" style={{ color }}>Certifications</h3>
                {data.certifications.map((cert, i) => (
                  <div key={i} className="text-[10px] mb-1">
                    <div className="font-medium">{cert.name}</div>
                    {cert.issuer && <div className="text-zinc-500">{cert.issuer}</div>}
                  </div>
                ))}
              </div>
            ) : null

            case 'interests': return data.interests?.length ? (
              <div key={section}>
                <h3 className="text-[9px] font-bold tracking-widest uppercase mb-2" style={{ color }}>Interests</h3>
                <p className="text-[10px] text-zinc-600">{data.interests.map(i => i.name).filter(Boolean).join(', ')}</p>
              </div>
            ) : null

            default: return null
          }
        })}
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 space-y-4">
        {mainSections.map(section => {
          const SectionTitle = ({ children }) => (
            <h2 className="text-[10px] font-bold tracking-widest uppercase mb-2 pb-1"
              style={{ color, borderBottom: `1.5px solid ${color}` }}>
              {children}
            </h2>
          )

          switch(section) {
            case 'experience': return data.experience?.length ? (
              <section key={section}>
                <SectionTitle>Work Experience</SectionTitle>
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
                      {exp.description && <div className="mt-1 text-[10px] text-zinc-700 [&_ul]:list-disc [&_ul]:pl-4"><HtmlContent html={exp.description} /></div>}
                    </div>
                  ))}
                </div>
              </section>
            ) : null

            case 'education': return data.education?.length ? (
              <section key={section}>
                <SectionTitle>Education</SectionTitle>
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
            ) : null

            case 'projects': return data.projects?.length ? (
              <section key={section}>
                <SectionTitle>Projects</SectionTitle>
                {data.projects.map((proj, i) => (
                  <div key={i} className="mb-2">
                    <div className="font-semibold text-[11px]">{proj.name}
                      {proj.technologies?.length > 0 && <span className="font-normal text-zinc-500 text-[9px] ml-2">{proj.technologies.join(', ')}</span>}
                    </div>
                    {proj.description && <div className="text-zinc-700 text-[10px] [&_ul]:list-disc [&_ul]:pl-4"><HtmlContent html={proj.description} /></div>}
                  </div>
                ))}
              </section>
            ) : null

            default: {
              const custom = data.customSections?.find(s => s.id === section)
              if (!custom) return null
              return (
                <section key={section}>
                  <SectionTitle>{custom.title}</SectionTitle>
                  {(custom.entries || []).map((entry, i) => (
                    <div key={i} className="mb-1">
                      {entry.title && <div className="font-semibold text-[11px]">{entry.title}</div>}
                      {entry.content && <div className="text-[10px] text-zinc-700 [&_ul]:list-disc [&_ul]:pl-4"><HtmlContent html={entry.content} /></div>}
                    </div>
                  ))}
                </section>
              )
            }
          }
        })}
      </div>
    </div>
  )
})

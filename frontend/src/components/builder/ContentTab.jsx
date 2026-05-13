import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import PersonalSection from './PersonalSection.jsx'
import ExperienceSection from './ExperienceSection.jsx'
import EducationSection from './EducationSection.jsx'
import SkillsSection from './SkillsSection.jsx'
import ProjectsSection from './ProjectsSection.jsx'
import { CertificationsSection, LanguagesSection, InterestsSection, CustomSectionEditor } from './OtherSections.jsx'

const SECTION_COMPONENTS = {
  personal:       { label: 'Personal Info',    component: PersonalSection },
  experience:     { label: 'Work Experience',  component: ExperienceSection },
  education:      { label: 'Education',        component: EducationSection },
  skills:         { label: 'Skills',           component: SkillsSection },
  projects:       { label: 'Projects',         component: ProjectsSection },
  certifications: { label: 'Certifications',   component: CertificationsSection },
  languages:      { label: 'Languages',        component: LanguagesSection },
  interests:      { label: 'Interests',        component: InterestsSection },
}

export function ContentTab({ cv, updateSection }) {
  const [activeSection, setActiveSection] = useState('personal')

  const customSections = cv.data?.customSections || []
  const allSections = [
    ...Object.entries(SECTION_COMPONENTS),
    ...customSections.map(cs => [cs.id, { label: cs.title, isCustom: true, data: cs }]),
  ]

  const orderedSections = cv.section_order
    ?.map(id => allSections.find(([sid]) => sid === id))
    .filter(Boolean) || allSections

  return (
    <div className="space-y-2">
      {orderedSections.map(([sectionId, sectionDef]) => {
        if (!sectionDef) return null
        if (!cv.enabled_sections?.includes(sectionId)) return null

        const isExpanded = activeSection === sectionId
        const label = sectionDef.label || sectionDef.title || sectionId

        return (
          <div key={sectionId} className="glass rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition-colors text-left"
              onClick={() => setActiveSection(isExpanded ? null : sectionId)}>
              <span className="flex-1 text-sm font-medium text-zinc-200">{label}</span>
              {isExpanded ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
            </button>
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-white/5 pt-4 animate-fade-in">
                {sectionDef.isCustom ? (
                  <CustomSectionEditor
                    section={sectionDef.data}
                    onChange={updated => {
                      const customs = (cv.data.customSections || []).map(cs => cs.id === updated.id ? updated : cs)
                      updateSection('customSections', customs)
                    }}
                    onDelete={() => {
                      const customs = (cv.data.customSections || []).filter(cs => cs.id !== sectionId)
                      updateSection('customSections', customs)
                    }}
                  />
                ) : (
                  (() => { const Comp = sectionDef.component; return <Comp /> })()
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

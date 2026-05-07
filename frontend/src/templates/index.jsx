import ModernTemplate from './ModernTemplate.jsx'
import ClassicTemplate from './ClassicTemplate.jsx'
import SidebarTemplate from './SidebarTemplate.jsx'
import ErrorBoundary from '../components/ui/ErrorBoundary.jsx'

export const TEMPLATES = {
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Clean centered header with color accents',
    component: ModernTemplate,
    ats: true,
  },
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional left-aligned academic style',
    component: ClassicTemplate,
    ats: true,
  },
  sidebar: {
    id: 'sidebar',
    name: 'Sidebar',
    description: 'Two-column layout with colored sidebar',
    component: SidebarTemplate,
    ats: false,
  },
}

export function getTemplate(id) {
  return TEMPLATES[id] || TEMPLATES.modern
}

export function CVRenderer({ cv, scale = 1 }) {
  const Template = getTemplate(cv?.template).component
  if (!cv) return null
  return (
    <ErrorBoundary>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <Template cv={cv} />
      </div>
    </ErrorBoundary>
  )
}

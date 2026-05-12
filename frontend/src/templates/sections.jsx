import DOMPurify from 'dompurify'

/**
 * Sanitised HTML renderer shared across all templates.
 * className defaults to 'prose-cv'; pass "" to omit it (Sidebar template).
 */
export function HtmlContent({ html, className = 'prose-cv' }) {
  if (!html) return null
  return (
    <div
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
      className={className || undefined}
    />
  )
}

/**
 * Single dispatch point replacing every switch(section) in template files.
 *
 * renderers  — { [sectionKey]: () => ReactNode | null }
 *              Include a __custom key to handle custom sections:
 *              __custom: (customSection) => ReactNode | null
 *
 * Keys that are not in renderers AND not found in data.customSections return null.
 */
export function renderSection(sectionKey, data, renderers) {
  if (sectionKey in renderers) return renderers[sectionKey]()
  const custom = data.customSections?.find(s => s.id === sectionKey)
  return custom && renderers.__custom ? renderers.__custom(custom) : null
}

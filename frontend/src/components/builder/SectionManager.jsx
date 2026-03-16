import { useCVStore } from '../../store/cvStore.js'
import { Toggle } from '../ui/Elements.jsx'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

const SECTION_LABELS = {
  personal: 'Personal Info',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
  interests: 'Interests',
  publications: 'Publications',
  volunteering: 'Volunteering',
}

function SortableItem({ id, label, enabled, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 p-2 rounded-lg glass transition-all ${isDragging ? 'opacity-50 scale-95' : ''}`}>
      <button {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 p-0.5">
        <GripVertical size={14} />
      </button>
      <span className="flex-1 text-sm text-zinc-300">{label}</span>
      <Toggle checked={enabled} onChange={onToggle} />
    </div>
  )
}

export default function SectionManager() {
  const { cv, reorderSections, toggleSection, updateSection } = useCVStore()
  const order = cv?.section_order || []
  const enabled = cv?.enabled_sections || []

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      const oldIdx = order.indexOf(active.id)
      const newIdx = order.indexOf(over.id)
      reorderSections(arrayMove(order, oldIdx, newIdx))
    }
  }

  const addCustomSection = () => {
    const id = `custom_${uuidv4().slice(0, 8)}`
    const newSection = { id, title: 'Custom Section', entries: [] }
    const customSections = [...(cv?.data?.customSections || []), newSection]
    updateSection('customSections', customSections)
    reorderSections([...order, id])
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500 mb-3">Drag to reorder. Toggle to show/hide sections.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          {order.map(id => {
            const customSection = cv?.data?.customSections?.find(s => s.id === id)
            const label = customSection ? customSection.title : (SECTION_LABELS[id] || id)
            return (
              <SortableItem
                key={id}
                id={id}
                label={label}
                enabled={enabled.includes(id)}
                onToggle={() => toggleSection(id)}
              />
            )
          })}
        </SortableContext>
      </DndContext>
      <button onClick={addCustomSection}
        className="w-full py-2 rounded-lg border border-dashed border-white/10 hover:border-indigo-500/30
        text-zinc-500 hover:text-indigo-400 text-xs flex items-center justify-center gap-1.5 transition-all mt-2">
        <Plus size={12} /> Add Custom Section
      </button>
    </div>
  )
}
